import React from 'react';
import { Users, Truck, Award, Clock } from "lucide-react";
import { useCompanyStats } from '@/hooks/useCompanyStats';

export default function StatsSection() {
  const { stats: companyStats, isLoading } = useCompanyStats();

  const stats = [
    {
      id: '1',
      label: 'Clientes Satisfeitos',
      value: isLoading ? '...' : companyStats?.clientesSatisfeitos || '0',
      description: 'Famílias economizando todos os meses',
      icon: Users,
      color: 'primary'
    },
    {
      id: '2',
      label: 'Produtos Disponíveis',
      value: isLoading ? '...' : companyStats?.produtosDisponiveis || '0',
      description: 'Itens essenciais com preços de atacado',
      icon: Award,
      color: 'secondary'
    },
    {
      id: '3',
      label: 'Entregas por Semana',
      value: isLoading ? '...' : companyStats?.entregasPorSemana || '0',
      description: 'Rapidez e pontualidade garantidas',
      icon: Truck,
      color: 'accent'
    },
    {
      id: '4',
      label: 'Anos de Experiência',
      value: isLoading ? '...' : companyStats?.anosExperiencia || '< 1',
      description: 'Tradição no atacarejo em Valparaíso',
      icon: Clock,
      color: 'primary'
    },
  ];
  return (
    <section className="section-padding bg-gradient-hero text-white">
      <div className="container-responsive">
        {/* Section Header */}
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-6">
            Números que Falam por Si
          </h2>
          <p className="text-xl text-white/80 max-w-3xl mx-auto leading-relaxed">
            Nossa experiência e dedicação refletem no sucesso dos nossos clientes
          </p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {stats.map((stat, index) => (
            <div 
              key={stat.id}
              className="text-center group animate-fade-in-up"
              style={{ animationDelay: `${index * 0.15}s` }}
            >
              <div className="relative mb-6">
                <div className="w-20 h-20 mx-auto bg-white/10 backdrop-blur-sm rounded-full flex items-center justify-center group-hover:bg-white/20 transition-all duration-300 group-hover:scale-110">
                  <stat.icon className="w-10 h-10 text-white" />
                </div>
                <div className="absolute inset-0 w-20 h-20 mx-auto rounded-full bg-white/5 animate-pulse-glow"></div>
              </div>

              <div className="space-y-2">
                <h3 className="text-4xl md:text-5xl font-bold text-accent">
                  {stat.value}
                </h3>
                <h4 className="text-xl font-semibold text-white">
                  {stat.label}
                </h4>
                <p className="text-white/70 leading-relaxed">
                  {stat.description}
                </p>
              </div>
            </div>
          ))}
        </div>

        {/* Bottom Message */}
        <div className="text-center mt-16 p-8 bg-white/10 backdrop-blur-sm rounded-2xl">
          <h3 className="text-2xl md:text-3xl font-bold mb-4">
            Junte-se à nossa família de clientes!
          </h3>
          <p className="text-white/80 text-lg">
            {isLoading ? (
              'Carregando estatísticas...'
            ) : (
              <>
                Mais de <span className="font-semibold text-accent">{companyStats?.faturamentoMensal || 'R$ 0'}</span> em produtos movimentados mensalmente,
                com economia real para cada cliente.
              </>
            )}
          </p>
        </div>
      </div>
    </section>
  );
}