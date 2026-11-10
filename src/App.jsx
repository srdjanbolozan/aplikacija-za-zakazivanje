import React, { useState, useEffect } from 'react';
import { supabase } from './supabaseClient';

export default function App() {
  const [services, setServices] = useState([]);
  const [selectedService, setSelectedService] = useState('');
  const [date, setDate] = useState('');
  const [time, setTime] = useState('');
  const [message, setMessage] = useState('');

  // 1. Učitavanje dostupnih usluga iz baze
  useEffect(() => {
    async function fetchServices() {
      const { data, error } = await supabase.from('services').select('*');
      if (error) console.error('Greška pri učitavanju usluga:', error);
      else setServices(data || []);
    }
    fetchServices();
  }, []);

  // 2. Slanje zahteva za zakazivanje
  const handleBooking = async (e) => {
    e.preventDefault();
    setMessage('');

    if (!selectedService || !date || !time) {
      setMessage('Molimo popunite sva polja.');
      return;
    }

    const chosenService = services.find((s) => s.id === selectedService);
    const startTime = new Date(`${date}T${time}:00`);
    const endTime = new Date(startTime.getTime() + chosenService.duration_minutes * 60000);

    // Privremeni testni ID-jevi (kasnije se menjaju ulogovanim korisnikom)
    const { error } = await supabase.from('appointments').insert([
      {
        provider_id: chosenService.provider_id,
        client_id: chosenService.provider_id, // Za test koristimo isti ID
        service_id: chosenService.id,
        start_time: startTime.toISOString(),
        end_time: endTime.toISOString(),
        status: 'confirmed',
      },
    ]);

    if (error) {
      if (error.message.includes('prevent_appointment_overlap')) {
        setMessage('Greška: Izabrani termin je već zauzet kod ovog majstora!');
      } else {
        setMessage('Greška pri zakazivanju: ' + error.message);
      }
    } else {
      setMessage('Uspešno ste zakazali termin!');
    }
  };

  return (
    <div style={{ maxWidth: '500px', margin: '40px auto', fontFamily: 'sans-serif', padding: '20px', border: '1px solid #ccc', borderRadius: '8px' }}>
      <h2>Zakazivanje Termina</h2>
      
      {message && <div style={{ padding: '10px', marginBottom: '15px', backgroundColor: message.includes('Uspešno') ? '#d4edda' : '#f8d7da', borderRadius: '4px' }}>{message}</div>}

      <form onSubmit={handleBooking}>
        <div style={{ marginBottom: '15px' }}>
          <label style={{ display: 'block', marginBottom: '5px' }}>Izaberite uslugu:</label>
          <select value={selectedService} onChange={(e) => setSelectedService(e.target.value)} style={{ width: '100%', padding: '8px' }}>
            <option value="">-- Izaberite --</option>
            {services.map((s) => (
              <option key={s.id} value={s.id}>
                {s.title} ({s.duration_minutes} min) - {s.price} RSD
              </option>
            ))}
          </select>
        </div>

        <div style={{ marginBottom: '15px' }}>
          <label style={{ display: 'block', marginBottom: '5px' }}>Datum:</label>
          <input type="date" value={date} onChange={(e) => setDate(e.target.value)} style={{ width: '100%', padding: '8px' }} />
        </div>

        <div style={{ marginBottom: '15px' }}>
          <label style={{ display: 'block', marginBottom: '5px' }}>Vreme početka:</label>
          <input type="time" value={time} onChange={(e) => setTime(e.target.value)} style={{ width: '100%', padding: '8px' }} />
        </div>

        <button type="submit" style={{ width: '100%', padding: '10px', backgroundColor: '#007bff', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>
          Zakaži termin
        </button>
      </form>
    </div>
  );
}