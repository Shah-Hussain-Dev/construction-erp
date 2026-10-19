'use client';
import { useRef, useState } from 'react';
import { useQuery, useQueryClient, useMutation } from '@tanstack/react-query';
import { Camera, MapPin } from '@phosphor-icons/react';
import { toast } from 'sonner';
import { dataClient } from '@/lib/api';
import { can } from '@/lib/domain.cjs';
import { text, day } from '@/lib/format';
import { useSession } from '../providers';
import { Button } from '../ui/button';
import { Modal } from '../ui/primitives';
type GPS = {
  latitude: number | null;
  longitude: number | null;
  accuracyM: number | null;
  permission: string;
  exceptionReason: string | null;
  capturedAt: string;
  receivedAt: string;
};
export function Evidence({ resource, id }: { resource: string; id: string }) {
  const { user, siteId, sites, online } = useSession();
  const qc = useQueryClient();
  const input = useRef<HTMLInputElement>(null);
  const [open, setOpen] = useState(false),
    [image, setImage] = useState(''),
    [gps, setGps] = useState<GPS | null>(null),
    [reason, setReason] = useState(''),
    [busy, setBusy] = useState(false);
  const query = useQuery({
    queryKey: ['evidence', id, user?.id],
    queryFn: () => dataClient.list('evidence'),
  });
  async function capture(file: File) {
    if (!file.type.startsWith('image/')) return toast.error('Choose an image.');
    if (file.size > 10 * 1024 * 1024) return toast.error('Use a photo under 10 MB.');
    setBusy(true);
    try {
      const bitmap = await createImageBitmap(file);
      const canvas = document.createElement('canvas');
      const scale = Math.min(1, 1400 / Math.max(bitmap.width, bitmap.height));
      canvas.width = bitmap.width * scale;
      canvas.height = bitmap.height * scale;
      canvas.getContext('2d')!.drawImage(bitmap, 0, 0, canvas.width, canvas.height);
      setImage(canvas.toDataURL('image/jpeg', 0.7));
      bitmap.close();
      setOpen(true);
      const timestamp = new Date().toISOString();
      const fallback = {
        latitude: null,
        longitude: null,
        accuracyM: null,
        permission: 'unavailable',
        exceptionReason: null,
        capturedAt: timestamp,
        receivedAt: timestamp,
      };
      setGps(fallback);
      if (navigator.geolocation)
        navigator.geolocation.getCurrentPosition(
          (p) =>
            setGps({
              ...fallback,
              latitude: p.coords.latitude,
              longitude: p.coords.longitude,
              accuracyM: p.coords.accuracy,
              permission: 'granted',
            }),
          (e) => setGps({ ...fallback, permission: e.code === 1 ? 'denied' : 'unavailable' }),
          { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 },
        );
    } catch {
      toast.error('Could not read this photo. Try a JPEG or PNG.');
    } finally {
      setBusy(false);
    }
  }
  const save = useMutation({
    mutationFn: async () => {
      if (!gps) throw Error('Location is still loading.');
      if (gps.permission !== 'granted' && !reason.trim())
        throw Error('Explain why GPS is unavailable.');
      const site = sites.find((s) => s.id === siteId);
      return dataClient.save('evidence', {
        name: 'Site evidence',
        recordType: resource,
        recordId: id,
        image,
        gps: {
          ...gps,
          exceptionReason: gps.permission === 'granted' ? null : reason,
          receivedAt: new Date().toISOString(),
        },
        siteId,
        projectId: site?.projectId,
        firmId: site?.firmId,
      });
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['evidence'] });
      toast.success('Evidence attached');
      setOpen(false);
      setImage('');
      setReason('');
    },
    onError: (e) => toast.error(e.message),
  });
  return (
    <section className="panel">
      <div className="section-heading">
        <div>
          <h2>Site evidence</h2>
          <p>Photos with capture-time location and an audit trail.</p>
        </div>
        {can(user, 'evidence', 'create') && (
          <Button
            variant="outline"
            onClick={() => input.current?.click()}
            disabled={busy || !online}
          >
            <Camera size={20} />
            {busy ? 'Preparing…' : 'Add photo'}
          </Button>
        )}
      </div>
      <input
        ref={input}
        type="file"
        accept="image/*"
        capture="environment"
        className="sr-only"
        aria-label="Capture or choose evidence photo"
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) capture(file);
          e.target.value = '';
        }}
      />
      <div className="evidence-gallery">
        {(query.data || [])
          .filter((r) => r.recordId === id)
          .map((r) => {
            const g = r.gps as GPS;
            return (
              <figure key={r.id}>
                <img
                  src={text(r.image)}
                  alt={`Site evidence captured ${day(g.capturedAt)}`}
                  width={400}
                  height={300}
                />
                <figcaption>
                  <MapPin size={16} />
                  {g.permission === 'granted'
                    ? `${g.latitude?.toFixed(5)}, ${g.longitude?.toFixed(5)} · ±${Math.round(g.accuracyM || 0)} m`
                    : `No GPS · ${g.exceptionReason}`}
                  <small>{day(g.capturedAt)}</small>
                </figcaption>
              </figure>
            );
          })}
      </div>
      {!query.data?.some((r) => r.recordId === id) && (
        <div className="evidence-empty">
          <Camera size={28} />
          <p>No photos attached yet.</p>
          <small>
            Camera access requires HTTPS or localhost. Your device may offer a file picker.
          </small>
        </div>
      )}
      <Modal
        open={open}
        onOpenChange={setOpen}
        title="Review site evidence"
        description="Location describes this capture session, not proof of the original photo’s location."
      >
        {image && (
          <img
            className="evidence-preview"
            src={image}
            alt="Photo ready to attach"
            width={600}
            height={400}
          />
        )}
        <p className="gps-status">
          <MapPin size={20} />
          {gps?.permission === 'granted'
            ? `GPS captured · accuracy ±${Math.round(gps.accuracyM || 0)} m`
            : 'GPS unavailable or permission denied'}
        </p>
        {gps?.permission !== 'granted' && (
          <label>
            Exception reason *
            <textarea
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="For example: indoors, location signal unavailable"
            />
          </label>
        )}
        <div className="dialog-actions">
          <Button variant="outline" onClick={() => setOpen(false)}>
            Cancel
          </Button>
          <Button onClick={() => save.mutate()} disabled={save.isPending || !online}>
            {save.isPending ? 'Uploading…' : 'Attach evidence'}
          </Button>
        </div>
      </Modal>
    </section>
  );
}
