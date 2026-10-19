import { test, expect } from '@playwright/test';
async function login(page: import('@playwright/test').Page, role = 'owner') {
  await page.goto('/login');
  await page.getByLabel('Email address').fill(`${role}@civil.example`);
  await page.getByLabel('Password', { exact: true }).fill('demo');
  await page.getByRole('button', { name: 'Sign in', exact: true }).click();
  await expect(
    page.getByRole('heading', {
      name: role === 'owner' ? 'Good to see you, Raghav.' : 'Projects',
      exact: true,
    }),
  ).toBeVisible();
}
test('dashboard and all register templates render', async ({ page }) => {
  test.slow();
  await login(page);
  for (const [url, title] of [
    ['/requests', 'Material requests'],
    ['/inventory/stock', 'Stock overview'],
    ['/purchasing/orders', 'Purchase orders'],
    ['/contractors/bills', 'Contractor bills'],
    ['/finance/vouchers', 'Vouchers'],
    ['/organisation/projects', 'Projects'],
    ['/approvals', 'Approval inbox'],
    ['/imports', 'Import materials'],
    ['/finance/trial-balance', 'Trial balance'],
  ]) {
    await page.goto(url);
    await expect(page.getByRole('heading', { name: title, exact: true })).toBeVisible();
    await expect(page.getByText('We couldn’t load this view')).toHaveCount(0);
  }
});
test('create, persist, submit and approve a material request', async ({ page }) => {
  await login(page);
  await page.getByRole('link', { name: 'New material request', exact: true }).click();
  await page.getByLabel('Purpose / work location').fill('E2E site request ' + Date.now());
  await page.getByRole('button', { name: 'Add line item' }).click();
  await page
    .getByLabel('Material 1', { exact: true })
    .selectOption({ label: 'OPC 43 Grade Cement · BAG' });
  await page.getByLabel('Quantity 1', { exact: true }).fill('2');
  await page.getByRole('button', { name: 'Save draft', exact: true }).click();
  await expect(page.getByRole('heading', { level: 1 })).toContainText('MR-26-');
  await page.reload();
  await expect(page.getByText('E2E site request').first()).toBeVisible();
  await page.getByRole('button', { name: 'Submit', exact: true }).click();
  await page.getByRole('dialog').getByRole('button', { name: 'Submit', exact: true }).click();
  await expect(page.getByRole('button', { name: 'Approve', exact: true })).toBeVisible();
  await page.getByRole('button', { name: 'Approve', exact: true }).click();
  await page.getByRole('dialog').getByRole('button', { name: 'Approve', exact: true }).click();
  await expect(page.getByText('Ready for fulfilment')).toBeVisible();
});
test('contractor portal blocks internal accounts and other contractors', async ({ page }) => {
  await login(page, 'contractor');
  await page.goto('/finance/vouchers');
  await expect(page.getByRole('heading', { name: 'Access restricted', exact: true })).toBeVisible();
  const response = await page.request.get('/api/vouchers');
  expect(response.status()).toBe(403);
  const bills = await (await page.request.get('/api/contractor-bills')).json();
  expect(
    bills.every((r: { contractorId: string }) => r.contractorId === bills[0].contractorId),
  ).toBe(true);
  expect(bills.some((r: { number: string }) => r.number === 'RA-26-0024')).toBe(false);
});
test('phone layouts do not overflow at required widths', async ({ page }) => {
  test.slow();
  await login(page);
  for (const width of [320, 360, 390, 430, 768, 1024, 1280, 1440]) {
    await page.setViewportSize({ width, height: 900 });
    for (const url of ['/', '/requests', '/requests/new']) {
      await page.goto(url);
      await expect(page.getByRole('heading', { level: 1 })).toBeVisible();
      const sizes = await page.evaluate(() => ({
        scroll: document.documentElement.scrollWidth,
        client: document.documentElement.clientWidth,
      }));
      expect(sizes.scroll, `${url} at ${width}px`).toBeLessThanOrEqual(sizes.client + 1);
    }
  }
});
test('mobile filter sheet is keyboard-dismissable and state persists', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await login(page);
  await page.goto('/requests');
  await page.getByRole('button', { name: 'Filters' }).click();
  await page.getByRole('dialog').getByLabel('Status', { exact: true }).selectOption('approved');
  await page.getByRole('button', { name: 'Apply filters' }).click();
  await expect(page).toHaveURL(/status=approved/);
  await page.reload();
  await expect(page).toHaveURL(/status=approved/);
  await expect(page.getByRole('navigation', { name: 'Mobile navigation' })).toBeVisible();
});
test('capture desktop and mobile review screenshots', async ({ page }) => {
  await login(page);
  await page.setViewportSize({ width: 1440, height: 1000 });
  await page.screenshot({ path: 'docs/screenshots/dashboard-desktop.png', fullPage: true });
  await page.setViewportSize({ width: 390, height: 844 });
  await page.screenshot({ path: 'docs/screenshots/dashboard-mobile.png', fullPage: true });
  await page.goto('/requests/new');
  await page.getByRole('button', { name: 'Add line item' }).click();
  await page.screenshot({ path: 'docs/screenshots/request-mobile.png', fullPage: true });
});
test('refined stock table supports selection, sorting and column controls', async ({ page }) => {
  test.slow();
  await login(page);
  await page.setViewportSize({ width: 1440, height: 1000 });
  await page.goto('/inventory/stock');
  await expect(page.getByRole('table')).toBeVisible();
  await page.getByRole('checkbox', { name: 'Select OPC 43 Grade Cement', exact: true }).check();
  await expect(page.getByText('1 records selected')).toBeVisible();
  await page.getByRole('button', { name: 'Columns', exact: true }).click();
  await page.getByRole('dialog').getByLabel('Reserved', { exact: true }).uncheck();
  await page.getByRole('button', { name: 'Done', exact: true }).click();
  await expect(page.getByRole('columnheader', { name: 'Reserved', exact: true })).toHaveCount(0);
  await page.getByRole('button', { name: 'On hand', exact: true }).click();
  await expect(page).toHaveURL(/sort=value/);
  await page.getByRole('button', { name: 'Clear selection', exact: true }).click();
  await page.screenshot({ path: 'docs/screenshots/stock-desktop.png', fullPage: true });
  await page.setViewportSize({ width: 390, height: 844 });
  await page.screenshot({ path: 'docs/screenshots/stock-mobile.png', fullPage: true });
});
test('local request draft survives a reload', async ({ page }) => {
  await login(page);
  await page.goto('/requests/new');
  await page.getByLabel('Purpose / work location').fill('Recover my locally saved request');
  await expect(page.getByText('Saved on this device')).toBeVisible();
  page.on('dialog', (dialog) => dialog.accept());
  await page.reload();
  await expect(page.getByLabel('Purpose / work location')).toHaveValue(
    'Recover my locally saved request',
  );
});
