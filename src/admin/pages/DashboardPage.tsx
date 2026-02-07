import {
  HiOutlineCalendar,
  HiOutlineCash,
  HiOutlineCheckCircle,
  HiOutlineXCircle,
  HiOutlineClock,
  HiOutlineUserGroup,
  HiOutlineSparkles,
  HiOutlineTrendingUp,
} from 'react-icons/hi';
import { useDashboardMetrics, type TodayAppointment } from '../hooks/useDashboardMetrics';
import { STATUS_CONFIG } from '../hooks/useAdminAppointments';
import { formatGTTime } from '../../lib/datetime';

export default function DashboardPage() {
  const {
    todayMetrics,
    weeklyMetrics,
    monthlyMetrics,
    staffMetrics,
    topServices,
    todayAppointments,
    loading,
    error,
  } = useDashboardMetrics();

  if (loading) {
    return (
      <div className="p-8">
        <h1 className="font-serif text-3xl text-text-primary mb-6">Dashboard</h1>
        <p className="text-text-secondary animate-pulse">Cargando metricas...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-8">
        <h1 className="font-serif text-3xl text-text-primary mb-6">Dashboard</h1>
        <p className="text-red-400">Error: {error}</p>
      </div>
    );
  }

  const formatCurrency = (amount: number) => `Q${amount.toLocaleString('es-GT')}`;

  return (
    <div className="p-8 space-y-8">
      {/* Header */}
      <div>
        <h1 className="font-serif text-3xl text-text-primary mb-2">Dashboard</h1>
        <p className="text-text-secondary">Resumen del negocio</p>
      </div>

      {/* Today's Summary Cards */}
      <section>
        <h2 className="text-sm font-sans font-medium text-text-muted uppercase tracking-wide mb-4">
          Hoy
        </h2>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <MetricCard
            icon={<HiOutlineCalendar className="w-6 h-6" />}
            label="Citas"
            value={todayMetrics?.totalAppointments || 0}
            color="text-accent"
          />
          <MetricCard
            icon={<HiOutlineCheckCircle className="w-6 h-6" />}
            label="Completadas"
            value={todayMetrics?.completedAppointments || 0}
            color="text-green-400"
          />
          <MetricCard
            icon={<HiOutlineXCircle className="w-6 h-6" />}
            label="Canceladas"
            value={todayMetrics?.cancelledAppointments || 0}
            color="text-red-400"
          />
          <MetricCard
            icon={<HiOutlineCash className="w-6 h-6" />}
            label="Ingresos"
            value={formatCurrency(todayMetrics?.totalRevenue || 0)}
            color="text-accent"
            isLarge
          />
        </div>
      </section>

      {/* Today's Appointments Timeline */}
      {todayAppointments.length > 0 && (
        <section>
          <h2 className="text-sm font-sans font-medium text-text-muted uppercase tracking-wide mb-4">
            Citas de hoy
          </h2>
          <div className="bg-primary-light border border-border rounded-lg divide-y divide-border">
            {todayAppointments.map((appt) => (
              <AppointmentRow key={appt.id} appointment={appt} />
            ))}
          </div>
        </section>
      )}

      {/* Weekly & Monthly Summary */}
      <div className="grid md:grid-cols-2 gap-6">
        <section>
          <h2 className="text-sm font-sans font-medium text-text-muted uppercase tracking-wide mb-4">
            Esta semana
          </h2>
          <div className="bg-primary-light border border-border rounded-lg p-5 space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-text-secondary">Total citas</span>
              <span className="text-text-primary font-medium">
                {weeklyMetrics?.totalAppointments || 0}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-text-secondary">Completadas</span>
              <span className="text-green-400 font-medium">
                {weeklyMetrics?.completedAppointments || 0}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-text-secondary">Canceladas / No asistieron</span>
              <span className="text-red-400 font-medium">
                {(weeklyMetrics?.cancelledAppointments || 0) +
                  (weeklyMetrics?.noShowAppointments || 0)}
              </span>
            </div>
            <div className="flex items-center justify-between pt-3 border-t border-border">
              <span className="text-text-primary font-medium">Ingresos</span>
              <span className="text-accent font-medium text-lg">
                {formatCurrency(weeklyMetrics?.totalRevenue || 0)}
              </span>
            </div>
          </div>
        </section>

        <section>
          <h2 className="text-sm font-sans font-medium text-text-muted uppercase tracking-wide mb-4">
            Este mes
          </h2>
          <div className="bg-primary-light border border-border rounded-lg p-5 space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-text-secondary">Total citas</span>
              <span className="text-text-primary font-medium">
                {monthlyMetrics?.totalAppointments || 0}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-text-secondary">Completadas</span>
              <span className="text-green-400 font-medium">
                {monthlyMetrics?.completedAppointments || 0}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-text-secondary">Canceladas / No asistieron</span>
              <span className="text-red-400 font-medium">
                {(monthlyMetrics?.cancelledAppointments || 0) +
                  (monthlyMetrics?.noShowAppointments || 0)}
              </span>
            </div>
            <div className="flex items-center justify-between pt-3 border-t border-border">
              <span className="text-text-primary font-medium">Ingresos</span>
              <span className="text-accent font-medium text-lg">
                {formatCurrency(monthlyMetrics?.totalRevenue || 0)}
              </span>
            </div>
          </div>
        </section>
      </div>

      {/* Staff Performance & Top Services */}
      <div className="grid md:grid-cols-2 gap-6">
        {/* Staff Performance */}
        {staffMetrics.length > 0 && (
          <section>
            <h2 className="text-sm font-sans font-medium text-text-muted uppercase tracking-wide mb-4 flex items-center gap-2">
              <HiOutlineUserGroup className="w-4 h-4" />
              Rendimiento del personal (mes)
            </h2>
            <div className="bg-primary-light border border-border rounded-lg divide-y divide-border">
              {staffMetrics.map((staff) => (
                <div key={staff.staffId} className="p-4 flex items-center justify-between">
                  <div>
                    <div className="text-text-primary font-medium">{staff.staffName}</div>
                    <div className="text-sm text-text-muted">
                      {staff.completedCount} de {staff.appointmentsCount} citas completadas
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-accent font-medium">
                      {formatCurrency(staff.revenue)}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Top Services */}
        {topServices.length > 0 && (
          <section>
            <h2 className="text-sm font-sans font-medium text-text-muted uppercase tracking-wide mb-4 flex items-center gap-2">
              <HiOutlineSparkles className="w-4 h-4" />
              Servicios mas populares (mes)
            </h2>
            <div className="bg-primary-light border border-border rounded-lg divide-y divide-border">
              {topServices.map((service, index) => (
                <div key={service.serviceId} className="p-4 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <span className="w-6 h-6 rounded-full bg-accent/20 text-accent text-xs flex items-center justify-center font-medium">
                      {index + 1}
                    </span>
                    <div>
                      <div className="text-text-primary font-medium">{service.serviceName}</div>
                      <div className="text-sm text-text-muted">
                        {service.bookingsCount} reservas
                      </div>
                    </div>
                  </div>
                  <div className="text-accent font-medium">
                    {formatCurrency(service.revenue)}
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}
      </div>

      {/* Quick Stats */}
      {monthlyMetrics && monthlyMetrics.completedAppointments > 0 && (
        <section>
          <h2 className="text-sm font-sans font-medium text-text-muted uppercase tracking-wide mb-4 flex items-center gap-2">
            <HiOutlineTrendingUp className="w-4 h-4" />
            Estadisticas del mes
          </h2>
          <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
            <div className="bg-primary-light border border-border rounded-lg p-4">
              <div className="text-text-muted text-sm mb-1">Promedio servicios/cita</div>
              <div className="text-text-primary font-medium text-lg">
                {monthlyMetrics.averageServicesPerAppointment.toFixed(1)}
              </div>
            </div>
            <div className="bg-primary-light border border-border rounded-lg p-4">
              <div className="text-text-muted text-sm mb-1">Tasa de completado</div>
              <div className="text-green-400 font-medium text-lg">
                {monthlyMetrics.totalAppointments > 0
                  ? Math.round(
                      (monthlyMetrics.completedAppointments / monthlyMetrics.totalAppointments) *
                        100
                    )
                  : 0}
                %
              </div>
            </div>
            <div className="bg-primary-light border border-border rounded-lg p-4">
              <div className="text-text-muted text-sm mb-1">Ticket promedio</div>
              <div className="text-accent font-medium text-lg">
                {formatCurrency(
                  monthlyMetrics.completedAppointments > 0
                    ? monthlyMetrics.totalRevenue / monthlyMetrics.completedAppointments
                    : 0
                )}
              </div>
            </div>
          </div>
        </section>
      )}
    </div>
  );
}

// Sub-components

interface MetricCardProps {
  icon: React.ReactNode;
  label: string;
  value: string | number;
  color: string;
  isLarge?: boolean;
}

function MetricCard({ icon, label, value, color, isLarge }: MetricCardProps) {
  return (
    <div className="bg-primary-light border border-border rounded-lg p-4">
      <div className={`${color} mb-2`}>{icon}</div>
      <div className="text-text-muted text-xs uppercase tracking-wide mb-1">{label}</div>
      <div className={`text-text-primary font-medium ${isLarge ? 'text-xl' : 'text-2xl'}`}>
        {value}
      </div>
    </div>
  );
}

interface AppointmentRowProps {
  appointment: TodayAppointment;
}

function AppointmentRow({ appointment }: AppointmentRowProps) {
  const statusConfig = STATUS_CONFIG[appointment.status as keyof typeof STATUS_CONFIG];

  return (
    <div className="p-4 flex items-center gap-4">
      <div className="flex items-center gap-2 text-text-muted min-w-[100px]">
        <HiOutlineClock className="w-4 h-4" />
        <span className="text-sm">{formatGTTime(appointment.starts_at)}</span>
      </div>
      <div className="flex-1">
        <span className="text-text-primary">
          {appointment.client.name}
        </span>
        <span className="text-text-muted text-sm ml-2">
          con {appointment.staff.name}
        </span>
      </div>
      <span
        className={`text-xs px-2 py-1 rounded ${statusConfig?.bgColor || 'bg-gray-500/20'} ${
          statusConfig?.color || 'text-gray-400'
        }`}
      >
        {statusConfig?.label || appointment.status}
      </span>
    </div>
  );
}
