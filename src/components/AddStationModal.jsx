import React, { useState } from 'react';
import { X, Plus, MapPin, Layers } from 'lucide-react';

export function AddStationModal({ isOpen, onClose, onAddStation }) {
  const [formData, setFormData] = useState({
    name: '',
    neighborhood: '',
    category: 'Urbana',
    type: 'IoT / Particular',
    lat: -22.5100,
    lng: -41.9300,
    altitude: 10,
    description: '',
    sensorTypes: 'Termômetro, Higrômetro, Pluviômetro'
  });

  if (!isOpen) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.name || !formData.neighborhood) return;

    const newStation = {
      id: `custom-${Date.now()}`,
      name: formData.name,
      neighborhood: formData.neighborhood,
      category: formData.category,
      type: formData.type,
      lat: parseFloat(formData.lat),
      lng: parseFloat(formData.lng),
      altitude: parseInt(formData.altitude, 10) || 5,
      description: formData.description || `Estação cadastrada em ${formData.neighborhood}.`,
      installedYear: new Date().getFullYear(),
      sensorTypes: formData.sensorTypes.split(',').map(s => s.trim()).filter(Boolean),
      status: 'online'
    };

    onAddStation(newStation);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-[1000] flex items-center justify-center p-4 bg-neutral-950/75 backdrop-blur-sm animate-fadeIn">
      <div 
        className="w-full max-w-lg bg-white dark:bg-zinc-900 rounded-3xl shadow-xl border border-neutral-200 dark:border-zinc-800 p-6 overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between pb-4 mb-4 border-b border-neutral-100 dark:border-zinc-800">
          <div>
            <h3 className="font-bold text-lg text-neutral-900 dark:text-neutral-100">
              Cadastrar Nova Estação Meteorológica
            </h3>
            <p className="text-xs text-neutral-500 dark:text-zinc-400">
              Adicione um ponto de monitoramento físico, particular ou CEMADEN
            </p>
          </div>
          <button onClick={onClose} className="p-2 rounded-xl text-neutral-400 hover:text-neutral-600 dark:hover:text-zinc-200">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          <div>
            <label className="block font-semibold text-neutral-700 dark:text-zinc-300 mb-1">
              Nome da Estação
            </label>
            <input 
              type="text" 
              placeholder="Ex: Estação Serramar - Pluviômetro" 
              required
              value={formData.name}
              onChange={e => setFormData({ ...formData, name: e.target.value })}
              className="w-full px-3 py-2 rounded-xl bg-neutral-50 dark:bg-zinc-800 border border-neutral-200 dark:border-zinc-700 text-neutral-900 dark:text-neutral-100 focus:ring-1 focus:ring-zinc-400 outline-none"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-semibold text-neutral-700 dark:text-zinc-300 mb-1">
                Bairro / Localidade
              </label>
              <input 
                type="text" 
                placeholder="Ex: Serramar, Bosque" 
                required
                value={formData.neighborhood}
                onChange={e => setFormData({ ...formData, neighborhood: e.target.value })}
                className="w-full px-3 py-2 rounded-xl bg-neutral-50 dark:bg-zinc-800 border border-neutral-200 dark:border-zinc-700 text-neutral-900 dark:text-neutral-100 focus:ring-1 focus:ring-zinc-400 outline-none"
              />
            </div>

            <div>
              <label className="block font-semibold text-neutral-700 dark:text-zinc-300 mb-1">
                Zona / Categoria
              </label>
              <select 
                value={formData.category}
                onChange={e => setFormData({ ...formData, category: e.target.value })}
                className="w-full px-3 py-2 rounded-xl bg-neutral-50 dark:bg-zinc-800 border border-neutral-200 dark:border-zinc-700 text-neutral-900 dark:text-neutral-100 focus:ring-1 focus:ring-zinc-400 outline-none"
              >
                <option value="Litoral">Litoral</option>
                <option value="Urbana">Urbana</option>
                <option value="Rural">Rural</option>
                <option value="Continental">Continental</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="block font-semibold text-neutral-700 dark:text-zinc-300 mb-1">
                Latitude
              </label>
              <input 
                type="number" 
                step="0.0001" 
                required
                value={formData.lat}
                onChange={e => setFormData({ ...formData, lat: e.target.value })}
                className="w-full px-3 py-2 rounded-xl bg-neutral-50 dark:bg-zinc-800 border border-neutral-200 dark:border-zinc-700 text-neutral-900 dark:text-neutral-100 focus:ring-1 focus:ring-zinc-400 outline-none"
              />
            </div>

            <div>
              <label className="block font-semibold text-neutral-700 dark:text-zinc-300 mb-1">
                Longitude
              </label>
              <input 
                type="number" 
                step="0.0001" 
                required
                value={formData.lng}
                onChange={e => setFormData({ ...formData, lng: e.target.value })}
                className="w-full px-3 py-2 rounded-xl bg-neutral-50 dark:bg-zinc-800 border border-neutral-200 dark:border-zinc-700 text-neutral-900 dark:text-neutral-100 focus:ring-1 focus:ring-zinc-400 outline-none"
              />
            </div>

            <div>
              <label className="block font-semibold text-neutral-700 dark:text-zinc-300 mb-1">
                Altitude (m)
              </label>
              <input 
                type="number" 
                value={formData.altitude}
                onChange={e => setFormData({ ...formData, altitude: e.target.value })}
                className="w-full px-3 py-2 rounded-xl bg-neutral-50 dark:bg-zinc-800 border border-neutral-200 dark:border-zinc-700 text-neutral-900 dark:text-neutral-100 focus:ring-1 focus:ring-zinc-400 outline-none"
              />
            </div>
          </div>

          <div>
            <label className="block font-semibold text-neutral-700 dark:text-zinc-300 mb-1">
              Sensores Disponíveis (separados por vírgula)
            </label>
            <input 
              type="text" 
              placeholder="Termômetro, Higrômetro, Pluviômetro, Anemômetro"
              value={formData.sensorTypes}
              onChange={e => setFormData({ ...formData, sensorTypes: e.target.value })}
              className="w-full px-3 py-2 rounded-xl bg-neutral-50 dark:bg-zinc-800 border border-neutral-200 dark:border-zinc-700 text-neutral-900 dark:text-neutral-100 focus:ring-1 focus:ring-zinc-400 outline-none"
            />
          </div>

          <div>
            <label className="block font-semibold text-neutral-700 dark:text-zinc-300 mb-1">
              Descrição / Observações Técnicas
            </label>
            <textarea 
              rows={2}
              placeholder="Ex: Sensor instalado em escola municipal para monitoramento de chuvas."
              value={formData.description}
              onChange={e => setFormData({ ...formData, description: e.target.value })}
              className="w-full px-3 py-2 rounded-xl bg-neutral-50 dark:bg-zinc-800 border border-neutral-200 dark:border-zinc-700 text-neutral-900 dark:text-neutral-100 focus:ring-1 focus:ring-zinc-400 outline-none resize-none"
            />
          </div>

          <div className="pt-2 flex items-center justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-neutral-600 dark:text-zinc-300 hover:bg-neutral-100 dark:hover:bg-zinc-800 font-medium"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="px-5 py-2 rounded-xl bg-sky-600 hover:bg-sky-500 text-white font-semibold flex items-center gap-1.5 shadow-xs transition active:scale-95"
            >
              <Plus className="w-4 h-4" />
              <span>Adicionar Estação</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
