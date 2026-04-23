import { useState, useEffect } from 'react';

export default function SettingsModal({
  isOpen,
  onClose,
  selectedMic,
  onSelectMic
}) {
  const [devices, setDevices] = useState([]);

  useEffect(() => {
    if (isOpen) {
      navigator.mediaDevices.enumerateDevices()
        .then(deviceInfos => {
          const audioInputs = deviceInfos.filter(d => d.kind === 'audioinput');
          setDevices(audioInputs);
          if (!selectedMic && audioInputs.length > 0) {
            onSelectMic(audioInputs[0].deviceId);
          }
        })
        .catch(err => console.error('Error fetching media devices', err));
    }
  }, [isOpen, selectedMic, onSelectMic]);

  if (!isOpen) return null;

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
          <h2 style={{ fontSize: '18px', margin: 0 }}>Settings</h2>
          <button onClick={onClose} className="tool-btn" style={{ background: 'transparent', color: 'white' }}>✕</button>
        </div>
        
        <div style={{ marginBottom: '20px' }}>
          <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px', color: 'var(--text-secondary)' }}>
            Microphone Source
          </label>
          <select 
            value={selectedMic || ''} 
            onChange={(e) => onSelectMic(e.target.value)}
            className="settings-select"
          >
            {devices.map(device => (
              <option key={device.deviceId} value={device.deviceId}>
                {device.label || `Microphone ${device.deviceId.slice(0, 5)}...`}
              </option>
            ))}
            {devices.length === 0 && (
              <option value="">No microphones found</option>
            )}
          </select>
          {devices.length === 0 && (
            <p style={{ fontSize: '12px', color: '#ff6b6b', marginTop: '8px' }}>
              Please allow microphone permissions to see available devices.
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
