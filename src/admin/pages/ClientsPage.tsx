import { useState, useEffect, useRef, useMemo } from 'react';
import {
  HiSearch,
  HiPencil,
  HiPlus,
  HiSortAscending,
  HiSortDescending,
  HiOutlineMail,
  HiOutlinePhone,
} from 'react-icons/hi';
import {
  useAdminClients,
  type AdminClient,
  type ClientFormData,
} from '../hooks/useAdminClients';
import ClientForm from '../components/ClientForm';
import { formatGTDisplayDate } from '../../lib/datetime';

export default function ClientsPage() {
  const { clients, loading, error, searchClients, createClient, updateClient } =
    useAdminClients();

  const [searchInput, setSearchInput] = useState('');
  const [editingClient, setEditingClient] = useState<AdminClient | null>(null);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');

  const debounceRef = useRef<NodeJS.Timeout | null>(null);

  // Debounced search
  useEffect(() => {
    if (debounceRef.current) {
      clearTimeout(debounceRef.current);
    }
    debounceRef.current = setTimeout(() => {
      searchClients(searchInput);
    }, 300);

    return () => {
      if (debounceRef.current) {
        clearTimeout(debounceRef.current);
      }
    };
  }, [searchInput, searchClients]);

  // Sort clients locally
  const sortedClients = useMemo(
    () =>
      [...clients].sort((a, b) =>
        sortOrder === 'asc'
          ? a.name.localeCompare(b.name)
          : b.name.localeCompare(a.name)
      ),
    [clients, sortOrder]
  );

  const handleCreate = () => {
    setShowCreateForm(true);
    setEditingClient(null);
    setFormError(null);
  };

  const handleEdit = (client: AdminClient) => {
    setEditingClient(client);
    setShowCreateForm(false);
    setFormError(null);
  };

  const handleCancel = () => {
    setEditingClient(null);
    setShowCreateForm(false);
    setFormError(null);
  };

  const handleCreateSubmit = async (data: ClientFormData) => {
    setIsSubmitting(true);
    setFormError(null);

    try {
      await createClient(data);
      setShowCreateForm(false);
    } catch (err) {
      setFormError(err instanceof Error ? err.message : 'Error al crear cliente');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEditSubmit = async (data: ClientFormData) => {
    if (!editingClient) return;

    setIsSubmitting(true);
    setFormError(null);

    try {
      await updateClient(editingClient.id, data);
      setEditingClient(null);
    } catch (err) {
      setFormError(err instanceof Error ? err.message : 'Error al guardar');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="p-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <h1 className="font-serif text-3xl text-text-primary">Clientes</h1>
        {!showCreateForm && !editingClient && (
          <button
            onClick={handleCreate}
            className="btn-cta text-xs flex items-center gap-2"
          >
            <HiPlus className="w-4 h-4" />
            Nuevo cliente
          </button>
        )}
      </div>

      {/* Search + Sort */}
      <div className="mb-6 flex items-center gap-3">
        <div className="relative max-w-md flex-1">
          <HiSearch className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-text-muted" />
          <input
            type="text"
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            placeholder="Buscar por nombre, email o telefono..."
            className="w-full bg-primary-dark border border-border rounded-md pl-10 pr-4 py-2.5 text-sm text-text-primary font-sans focus:outline-none focus:border-accent transition-colors"
          />
        </div>
        <button
          onClick={() => setSortOrder((prev) => (prev === 'asc' ? 'desc' : 'asc'))}
          className="p-2.5 rounded-md border border-border text-text-secondary hover:text-accent hover:border-accent/50 transition-colors"
          title={sortOrder === 'asc' ? 'Ordenar Z-A' : 'Ordenar A-Z'}
        >
          {sortOrder === 'asc' ? (
            <HiSortAscending className="w-5 h-5" />
          ) : (
            <HiSortDescending className="w-5 h-5" />
          )}
        </button>
      </div>

      {/* Create form */}
      {showCreateForm && (
        <div className="mb-8 bg-primary-light border border-border rounded-lg p-6 max-w-xl">
          <h2 className="font-serif text-xl text-text-primary mb-4">
            Nuevo cliente
          </h2>
          {formError && (
            <div className="mb-4 p-3 bg-red-500/10 border border-red-500/30 rounded-md">
              <p className="text-red-400 text-sm">{formError}</p>
            </div>
          )}
          <ClientForm
            onSubmit={handleCreateSubmit}
            onCancel={handleCancel}
            isSubmitting={isSubmitting}
            mode="create"
          />
        </div>
      )}

      {/* Edit form */}
      {editingClient && (
        <div className="mb-8 bg-primary-light border border-border rounded-lg p-6 max-w-xl">
          <h2 className="font-serif text-xl text-text-primary mb-4">
            Editar cliente: {editingClient.name}
          </h2>
          {formError && (
            <div className="mb-4 p-3 bg-red-500/10 border border-red-500/30 rounded-md">
              <p className="text-red-400 text-sm">{formError}</p>
            </div>
          )}
          <ClientForm
            client={editingClient}
            onSubmit={handleEditSubmit}
            onCancel={handleCancel}
            isSubmitting={isSubmitting}
            mode="edit"
          />
        </div>
      )}

      {/* Clients list */}
      {loading ? (
        <p className="text-text-secondary animate-pulse">Cargando clientes...</p>
      ) : error ? (
        <p className="text-red-400">Error: {error}</p>
      ) : clients.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-text-muted">
            {searchInput
              ? 'No se encontraron clientes con esa busqueda.'
              : 'No hay clientes registrados.'}
          </p>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-border">
                <th className="text-left py-3 px-4 text-xs text-text-muted font-sans font-medium uppercase tracking-wide">
                  Nombre
                </th>
                <th className="text-left py-3 px-4 text-xs text-text-muted font-sans font-medium uppercase tracking-wide">
                  Contacto
                </th>
                <th className="text-left py-3 px-4 text-xs text-text-muted font-sans font-medium uppercase tracking-wide">
                  Notas
                </th>
                <th className="text-left py-3 px-4 text-xs text-text-muted font-sans font-medium uppercase tracking-wide">
                  Cumpleanos
                </th>
                <th className="text-left py-3 px-4 text-xs text-text-muted font-sans font-medium uppercase tracking-wide">
                  Desde
                </th>
                <th className="py-3 px-4"></th>
              </tr>
            </thead>
            <tbody>
              {sortedClients.map((client) => (
                <tr
                  key={client.id}
                  className="border-b border-border/50 hover:bg-primary-light/50 transition-colors"
                >
                  <td className="py-4 px-4">
                    <span className="font-sans text-text-primary">
                      {client.name}
                    </span>
                  </td>
                  <td className="py-4 px-4">
                    <div className="flex flex-col gap-1 text-sm text-text-secondary">
                      {client.email && (
                        <span className="flex items-center gap-1">
                          <HiOutlineMail className="w-3.5 h-3.5 text-text-muted" />
                          {client.email}
                        </span>
                      )}
                      {client.phone && (
                        <span className="flex items-center gap-1">
                          <HiOutlinePhone className="w-3.5 h-3.5 text-text-muted" />
                          {client.phone}
                        </span>
                      )}
                      {!client.email && !client.phone && (
                        <span className="text-text-muted italic">Sin contacto</span>
                      )}
                    </div>
                  </td>
                  <td className="py-4 px-4">
                    {client.notes ? (
                      <span className="text-sm text-text-secondary line-clamp-2">
                        {client.notes}
                      </span>
                    ) : (
                      <span className="text-sm text-text-muted italic">-</span>
                    )}
                  </td>
                  <td className="py-4 px-4">
                    {client.birthday ? (
                      <span className="text-sm text-text-secondary">
                        {client.birthday}
                      </span>
                    ) : (
                      <span className="text-sm text-text-muted italic">-</span>
                    )}
                  </td>
                  <td className="py-4 px-4">
                    <span className="text-sm text-text-muted">
                      {formatGTDisplayDate(client.created_at)}
                    </span>
                  </td>
                  <td className="py-4 px-4">
                    <button
                      onClick={() => handleEdit(client)}
                      className="p-2 rounded-md border border-border text-text-secondary hover:text-accent hover:border-accent/50 transition-colors"
                    >
                      <HiPencil className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
