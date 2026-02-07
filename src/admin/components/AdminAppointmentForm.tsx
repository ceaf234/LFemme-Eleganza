import { useState, useEffect, useRef } from 'react';
import { HiOutlineSearch, HiOutlineX } from 'react-icons/hi';
import { supabase } from '../../lib/supabase';
import type { AdminStaff } from '../hooks/useAdminStaff';
import type { AdminService } from '../hooks/useAdminServices';
import type { AdminAppointmentFormData } from '../hooks/useCreateAdminAppointment';

interface ClientSearchResult {
  id: number;
  first_name: string;
  last_name: string;
  phone: string | null;
  email: string | null;
}

interface AdminAppointmentFormProps {
  staffList: AdminStaff[];
  servicesList: AdminService[];
  onSubmit: (data: AdminAppointmentFormData) => Promise<void>;
  onCancel: () => void;
  isSubmitting: boolean;
}

const DAY_NAMES = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'] as const;

function normalizePhone(raw: string): string {
  return raw.replace(/\D/g, '');
}

function formatPhoneDisplay(raw: string): string {
  const digits = normalizePhone(raw);
  if (digits.length <= 4) return digits;
  return `${digits.slice(0, 4)}-${digits.slice(4, 8)}`;
}

export default function AdminAppointmentForm({
  staffList,
  servicesList,
  onSubmit,
  onCancel,
  isSubmitting,
}: AdminAppointmentFormProps) {
  const activeStaff = staffList.filter((s) => s.is_active);
  const activeServices = servicesList.filter((s) => s.is_active);

  // Form state
  const [clientMode, setClientMode] = useState<'existing' | 'new'>('existing');
  const [selectedClientId, setSelectedClientId] = useState<number | null>(null);
  const [selectedClientName, setSelectedClientName] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<ClientSearchResult[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);

  const [newClient, setNewClient] = useState({
    first_name: '',
    last_name: '',
    phone: '',
    email: '',
  });

  const [staffId, setStaffId] = useState<number>(0);
  const [serviceIds, setServiceIds] = useState<number[]>([]);
  const [date, setDate] = useState('');
  const [time, setTime] = useState('');
  const [notes, setNotes] = useState('');

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [scheduleWarning, setScheduleWarning] = useState('');

  const searchTimeoutRef = useRef<number | null>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Debounced client search
  useEffect(() => {
    if (clientMode !== 'existing' || searchQuery.trim().length < 2) {
      setSearchResults([]);
      setShowDropdown(false);
      return;
    }

    if (searchTimeoutRef.current) clearTimeout(searchTimeoutRef.current);

    searchTimeoutRef.current = window.setTimeout(async () => {
      setIsSearching(true);
      const search = `%${searchQuery.trim()}%`;

      const { data } = await supabase
        .from('clients')
        .select('id, first_name, last_name, phone, email')
        .or(
          `first_name.ilike.${search},last_name.ilike.${search},email.ilike.${search},phone.ilike.${search}`
        )
        .limit(10);

      setSearchResults((data as ClientSearchResult[]) ?? []);
      setShowDropdown(true);
      setIsSearching(false);
    }, 300);

    return () => {
      if (searchTimeoutRef.current) clearTimeout(searchTimeoutRef.current);
    };
  }, [searchQuery, clientMode]);

  // Close dropdown on click outside
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setShowDropdown(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Schedule warning
  useEffect(() => {
    if (!staffId || !date || !time) {
      setScheduleWarning('');
      return;
    }

    const selectedStaff = activeStaff.find((s) => s.id === staffId);
    if (!selectedStaff) return;

    const dayOfWeek = new Date(`${date}T12:00:00-06:00`).getDay();
    const dayName = DAY_NAMES[dayOfWeek];
    const startKey = `${dayName}_start` as keyof AdminStaff;
    const endKey = `${dayName}_end` as keyof AdminStaff;

    const dayStart = selectedStaff[startKey] as string | null;
    const dayEnd = selectedStaff[endKey] as string | null;

    if (!dayStart || !dayEnd) {
      setScheduleWarning(`${selectedStaff.first_name} no trabaja este dia.`);
      return;
    }

    if (time < dayStart || time >= dayEnd) {
      setScheduleWarning(
        `Horario fuera del turno de ${selectedStaff.first_name} (${dayStart} - ${dayEnd}).`
      );
      return;
    }

    setScheduleWarning('');
  }, [staffId, date, time, activeStaff]);

  const handleSelectClient = (client: ClientSearchResult) => {
    setSelectedClientId(client.id);
    setSelectedClientName(`${client.first_name} ${client.last_name}`);
    setSearchQuery('');
    setShowDropdown(false);
    setErrors((prev) => ({ ...prev, client: '' }));
  };

  const handleClearClient = () => {
    setSelectedClientId(null);
    setSelectedClientName('');
    setSearchQuery('');
  };

  const handlePhoneChange = (value: string) => {
    const digits = normalizePhone(value);
    if (digits.length <= 8) {
      setNewClient((prev) => ({ ...prev, phone: digits }));
      setErrors((prev) => ({ ...prev, phone: '' }));
    }
  };

  const handleToggleService = (serviceId: number) => {
    setServiceIds((prev) =>
      prev.includes(serviceId)
        ? prev.filter((id) => id !== serviceId)
        : [...prev, serviceId]
    );
    setErrors((prev) => ({ ...prev, services: '' }));
  };

  const validate = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (clientMode === 'existing' && !selectedClientId) {
      newErrors.client = 'Selecciona un cliente.';
    }
    if (clientMode === 'new') {
      if (!newClient.first_name.trim()) newErrors.first_name = 'Nombre es obligatorio.';
      const digits = normalizePhone(newClient.phone);
      if (digits.length !== 8) newErrors.phone = 'El telefono debe tener 8 digitos.';
    }
    if (!staffId) newErrors.staff = 'Selecciona un miembro del personal.';
    if (serviceIds.length === 0) newErrors.services = 'Selecciona al menos un servicio.';
    if (!date) newErrors.date = 'Selecciona una fecha.';
    if (!time) newErrors.time = 'Selecciona una hora.';

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    await onSubmit({
      clientMode,
      selectedClientId,
      newClient,
      staff_id: staffId,
      date,
      time,
      service_ids: serviceIds,
      notes,
    });
  };

  // Computed totals
  const selectedServices = activeServices.filter((s) => serviceIds.includes(s.id));
  const totalDuration = selectedServices.reduce((sum, s) => sum + s.duration_minutes, 0);
  const totalPrice = selectedServices.reduce((sum, s) => sum + s.price, 0);

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Client section */}
      <div>
        <label className="block text-sm text-text-secondary mb-2">Cliente</label>

        {/* Mode toggle */}
        <div className="flex gap-2 mb-3">
          <button
            type="button"
            onClick={() => { setClientMode('existing'); setErrors((prev) => ({ ...prev, client: '', first_name: '', phone: '' })); }}
            className={`px-3 py-1.5 text-xs rounded-full border transition-colors ${
              clientMode === 'existing'
                ? 'border-accent bg-accent/10 text-accent'
                : 'border-border text-text-secondary hover:border-accent/50'
            }`}
          >
            Buscar cliente
          </button>
          <button
            type="button"
            onClick={() => { setClientMode('new'); setErrors((prev) => ({ ...prev, client: '', first_name: '', phone: '' })); }}
            className={`px-3 py-1.5 text-xs rounded-full border transition-colors ${
              clientMode === 'new'
                ? 'border-accent bg-accent/10 text-accent'
                : 'border-border text-text-secondary hover:border-accent/50'
            }`}
          >
            Nuevo cliente
          </button>
        </div>

        {clientMode === 'existing' ? (
          <div ref={dropdownRef} className="relative">
            {selectedClientId ? (
              <div className="flex items-center gap-2 px-3 py-2 bg-accent/10 border border-accent/30 rounded-md">
                <span className="text-text-primary text-sm flex-1">{selectedClientName}</span>
                <button type="button" onClick={handleClearClient} className="text-text-muted hover:text-text-primary">
                  <HiOutlineX className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <>
                <div className="relative">
                  <HiOutlineSearch className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Buscar por nombre, telefono o email..."
                    className="w-full pl-9 pr-3 py-2 bg-primary border border-border rounded-md text-text-primary text-sm focus:border-accent focus:outline-none"
                  />
                </div>
                {showDropdown && (
                  <div className="absolute z-10 mt-1 w-full bg-primary-light border border-border rounded-md shadow-lg max-h-60 overflow-y-auto">
                    {isSearching ? (
                      <div className="px-3 py-2 text-text-muted text-sm">Buscando...</div>
                    ) : searchResults.length === 0 ? (
                      <div className="px-3 py-2 text-text-muted text-sm">No se encontraron clientes.</div>
                    ) : (
                      searchResults.map((client) => (
                        <button
                          key={client.id}
                          type="button"
                          onClick={() => handleSelectClient(client)}
                          className="w-full text-left px-3 py-2 hover:bg-accent/10 transition-colors"
                        >
                          <div className="text-text-primary text-sm">
                            {client.first_name} {client.last_name}
                          </div>
                          <div className="text-text-muted text-xs">
                            {client.phone && formatPhoneDisplay(client.phone)}
                            {client.phone && client.email && ' · '}
                            {client.email}
                          </div>
                        </button>
                      ))
                    )}
                  </div>
                )}
              </>
            )}
            {errors.client && <p className="text-red-400 text-xs mt-1">{errors.client}</p>}
          </div>
        ) : (
          <div className="space-y-3">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <input
                  type="text"
                  value={newClient.first_name}
                  onChange={(e) => { setNewClient((prev) => ({ ...prev, first_name: e.target.value })); setErrors((prev) => ({ ...prev, first_name: '' })); }}
                  placeholder="Nombre *"
                  className={`w-full px-3 py-2 bg-primary border rounded-md text-text-primary text-sm focus:border-accent focus:outline-none ${errors.first_name ? 'border-red-500' : 'border-border'}`}
                />
                {errors.first_name && <p className="text-red-400 text-xs mt-1">{errors.first_name}</p>}
              </div>
              <div>
                <input
                  type="text"
                  value={newClient.last_name}
                  onChange={(e) => setNewClient((prev) => ({ ...prev, last_name: e.target.value }))}
                  placeholder="Apellido"
                  className="w-full px-3 py-2 bg-primary border border-border rounded-md text-text-primary text-sm focus:border-accent focus:outline-none"
                />
              </div>
            </div>
            <div>
              <input
                type="tel"
                value={formatPhoneDisplay(newClient.phone)}
                onChange={(e) => handlePhoneChange(e.target.value)}
                placeholder="XXXX-XXXX *"
                maxLength={9}
                className={`w-full px-3 py-2 bg-primary border rounded-md text-text-primary text-sm focus:border-accent focus:outline-none ${errors.phone ? 'border-red-500' : 'border-border'}`}
              />
              {errors.phone && <p className="text-red-400 text-xs mt-1">{errors.phone}</p>}
            </div>
            <input
              type="email"
              value={newClient.email}
              onChange={(e) => setNewClient((prev) => ({ ...prev, email: e.target.value }))}
              placeholder="Email (opcional)"
              className="w-full px-3 py-2 bg-primary border border-border rounded-md text-text-primary text-sm focus:border-accent focus:outline-none"
            />
          </div>
        )}
      </div>

      {/* Staff dropdown */}
      <div>
        <label className="block text-sm text-text-secondary mb-2">Personal</label>
        <select
          value={staffId}
          onChange={(e) => { setStaffId(Number(e.target.value)); setErrors((prev) => ({ ...prev, staff: '' })); }}
          className={`w-full px-3 py-2 bg-primary border rounded-md text-text-primary text-sm focus:border-accent focus:outline-none ${errors.staff ? 'border-red-500' : 'border-border'}`}
        >
          <option value={0}>Seleccionar personal</option>
          {activeStaff.map((s) => (
            <option key={s.id} value={s.id}>
              {s.first_name} {s.last_name}
            </option>
          ))}
        </select>
        {errors.staff && <p className="text-red-400 text-xs mt-1">{errors.staff}</p>}
      </div>

      {/* Services multi-select */}
      <div>
        <label className="block text-sm text-text-secondary mb-2">Servicios</label>
        <div className="space-y-2 max-h-48 overflow-y-auto border border-border rounded-md p-3 bg-primary">
          {activeServices.map((service) => (
            <label
              key={service.id}
              className="flex items-center gap-3 cursor-pointer hover:bg-accent/5 rounded px-2 py-1.5 transition-colors"
            >
              <input
                type="checkbox"
                checked={serviceIds.includes(service.id)}
                onChange={() => handleToggleService(service.id)}
                className="accent-[#C9A84C] w-4 h-4"
              />
              <span className="flex-1 text-text-primary text-sm">{service.name}</span>
              <span className="text-text-muted text-xs">{service.duration_minutes} min</span>
              <span className="text-accent text-sm">Q{service.price}</span>
            </label>
          ))}
        </div>
        {serviceIds.length > 0 && (
          <div className="mt-2 flex justify-between text-xs text-text-secondary px-1">
            <span>Duracion: {totalDuration} min</span>
            <span className="text-accent font-medium">Total: Q{totalPrice}</span>
          </div>
        )}
        {errors.services && <p className="text-red-400 text-xs mt-1">{errors.services}</p>}
      </div>

      {/* Date and Time */}
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm text-text-secondary mb-2">Fecha</label>
          <input
            type="date"
            value={date}
            onChange={(e) => { setDate(e.target.value); setErrors((prev) => ({ ...prev, date: '' })); }}
            className={`w-full px-3 py-2 bg-primary border rounded-md text-text-primary text-sm focus:border-accent focus:outline-none ${errors.date ? 'border-red-500' : 'border-border'}`}
          />
          {errors.date && <p className="text-red-400 text-xs mt-1">{errors.date}</p>}
        </div>
        <div>
          <label className="block text-sm text-text-secondary mb-2">Hora</label>
          <input
            type="time"
            value={time}
            onChange={(e) => { setTime(e.target.value); setErrors((prev) => ({ ...prev, time: '' })); }}
            className={`w-full px-3 py-2 bg-primary border rounded-md text-text-primary text-sm focus:border-accent focus:outline-none ${errors.time ? 'border-red-500' : 'border-border'}`}
          />
          {errors.time && <p className="text-red-400 text-xs mt-1">{errors.time}</p>}
        </div>
      </div>

      {/* Schedule warning */}
      {scheduleWarning && (
        <div className="p-3 bg-yellow-500/10 border border-yellow-500/30 rounded-md">
          <p className="text-yellow-400 text-xs">{scheduleWarning}</p>
        </div>
      )}

      {/* Notes */}
      <div>
        <label className="block text-sm text-text-secondary mb-2">Notas (opcional)</label>
        <textarea
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          rows={3}
          placeholder="Notas adicionales..."
          className="w-full px-3 py-2 bg-primary border border-border rounded-md text-text-primary text-sm focus:border-accent focus:outline-none resize-none"
        />
      </div>

      {/* Actions */}
      <div className="flex gap-3">
        <button
          type="button"
          onClick={onCancel}
          disabled={isSubmitting}
          className="btn-outline text-xs flex-1"
        >
          Cancelar
        </button>
        <button
          type="submit"
          disabled={isSubmitting}
          className="btn-cta text-xs flex-1 disabled:opacity-60"
        >
          {isSubmitting ? 'Creando...' : 'Crear cita'}
        </button>
      </div>
    </form>
  );
}
