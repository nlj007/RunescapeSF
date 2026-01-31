import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { 
  Settings as SettingsIcon,
  Map,
  MapPin,
  Trophy,
  Sliders,
  Battery,
  Volume2,
  Palette,
  ChevronRight,
  Plus,
  Download,
  Upload,
  RefreshCw
} from 'lucide-react';
import BottomNav from '@/components/ui/BottomNav';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Slider } from '@/components/ui/slider';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export default function Settings() {
  const queryClient = useQueryClient();

  const { data: settings } = useQuery({
    queryKey: ['appSettings'],
    queryFn: async () => {
      const list = await base44.entities.AppSettings.list();
      return list[0] || {
        gps_polling_interval: 3,
        map_style: 'classic',
        sound_enabled: true,
        battery_saver_mode: false,
        fog_opacity: 0.75,
        default_zoom: 15
      };
    }
  });

  const { data: zones = [] } = useQuery({
    queryKey: ['zones'],
    queryFn: () => base44.entities.Zone.list()
  });

  const { data: pins = [] } = useQuery({
    queryKey: ['pins'],
    queryFn: () => base44.entities.Pin.list()
  });

  const { data: achievements = [] } = useQuery({
    queryKey: ['achievements'],
    queryFn: () => base44.entities.Achievement.list()
  });

  const updateSettingsMutation = useMutation({
    mutationFn: async (data) => {
      const list = await base44.entities.AppSettings.list();
      if (list[0]) {
        return base44.entities.AppSettings.update(list[0].id, data);
      } else {
        return base44.entities.AppSettings.create(data);
      }
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['appSettings'] })
  });

  const handleSettingChange = (key, value) => {
    updateSettingsMutation.mutate({ ...settings, [key]: value });
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-amber-50 to-amber-100 pb-20">
      {/* Header */}
      <div className="bg-gradient-to-r from-amber-700 to-amber-800 px-4 py-6 shadow-lg">
        <h1 className="text-2xl font-medieval font-bold text-amber-100 flex items-center gap-2">
          <SettingsIcon className="w-6 h-6" />
          Settings
        </h1>
      </div>

      <div className="px-4 py-4 space-y-4">
        {/* Configuration Links */}
        <div className="bg-white rounded-xl border border-amber-200 overflow-hidden">
          <div className="px-4 py-3 bg-amber-50 border-b border-amber-200">
            <h2 className="font-medieval font-bold text-amber-800">Configuration Dashboard</h2>
          </div>
          
          <Link to={createPageUrl('ZoneEditor')}>
            <SettingLink 
              icon={Map} 
              title="Zone Editor" 
              subtitle={`${zones.length} zones configured`}
              color="text-blue-600"
            />
          </Link>
          
          <Link to={createPageUrl('PinEditor')}>
            <SettingLink 
              icon={MapPin} 
              title="Pin Editor" 
              subtitle={`${pins.length} pins configured`}
              color="text-purple-600"
            />
          </Link>
          
          <Link to={createPageUrl('AchievementEditor')}>
            <SettingLink 
              icon={Trophy} 
              title="Achievement Editor" 
              subtitle={`${achievements.length} achievements`}
              color="text-amber-600"
              isLast
            />
          </Link>
        </div>

        {/* GPS Settings */}
        <div className="bg-white rounded-xl border border-amber-200 overflow-hidden">
          <div className="px-4 py-3 bg-amber-50 border-b border-amber-200">
            <h2 className="font-medieval font-bold text-amber-800">GPS & Tracking</h2>
          </div>
          
          <div className="p-4 space-y-4">
            <div>
              <Label className="text-sm text-gray-700">Polling Interval: {settings?.gps_polling_interval || 3}s</Label>
              <Slider
                value={[settings?.gps_polling_interval || 3]}
                onValueChange={([v]) => handleSettingChange('gps_polling_interval', v)}
                min={1}
                max={10}
                step={1}
                className="mt-2"
              />
              <p className="text-xs text-gray-500 mt-1">How often to update your location</p>
            </div>

            <div className="flex items-center justify-between">
              <div>
                <Label className="text-sm text-gray-700">Battery Saver Mode</Label>
                <p className="text-xs text-gray-500">Reduces GPS polling frequency</p>
              </div>
              <Switch
                checked={settings?.battery_saver_mode || false}
                onCheckedChange={(v) => handleSettingChange('battery_saver_mode', v)}
              />
            </div>
          </div>
        </div>

        {/* Map Settings */}
        <div className="bg-white rounded-xl border border-amber-200 overflow-hidden">
          <div className="px-4 py-3 bg-amber-50 border-b border-amber-200">
            <h2 className="font-medieval font-bold text-amber-800">Map Display</h2>
          </div>
          
          <div className="p-4 space-y-4">
            <div>
              <Label className="text-sm text-gray-700">Map Style</Label>
              <Select
                value={settings?.map_style || 'classic'}
                onValueChange={(v) => handleSettingChange('map_style', v)}
              >
                <SelectTrigger className="mt-1">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="classic">Classic (Light)</SelectItem>
                  <SelectItem value="dark">Dark Mode</SelectItem>
                  <SelectItem value="parchment">Parchment (Fantasy)</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label className="text-sm text-gray-700">Fog Opacity: {Math.round((settings?.fog_opacity || 0.75) * 100)}%</Label>
              <Slider
                value={[(settings?.fog_opacity || 0.75) * 100]}
                onValueChange={([v]) => handleSettingChange('fog_opacity', v / 100)}
                min={30}
                max={100}
                step={5}
                className="mt-2"
              />
            </div>

            <div>
              <Label className="text-sm text-gray-700">Default Zoom: {settings?.default_zoom || 15}</Label>
              <Slider
                value={[settings?.default_zoom || 15]}
                onValueChange={([v]) => handleSettingChange('default_zoom', v)}
                min={10}
                max={18}
                step={1}
                className="mt-2"
              />
            </div>
          </div>
        </div>

        {/* Sound Settings */}
        <div className="bg-white rounded-xl border border-amber-200 overflow-hidden">
          <div className="px-4 py-3 bg-amber-50 border-b border-amber-200">
            <h2 className="font-medieval font-bold text-amber-800">Audio</h2>
          </div>
          
          <div className="p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Volume2 className="w-5 h-5 text-amber-600" />
                <div>
                  <Label className="text-sm text-gray-700">Sound Effects</Label>
                  <p className="text-xs text-gray-500">Play sounds on discoveries</p>
                </div>
              </div>
              <Switch
                checked={settings?.sound_enabled ?? true}
                onCheckedChange={(v) => handleSettingChange('sound_enabled', v)}
              />
            </div>
          </div>
        </div>

        {/* Data Management */}
        <div className="bg-white rounded-xl border border-amber-200 overflow-hidden">
          <div className="px-4 py-3 bg-amber-50 border-b border-amber-200">
            <h2 className="font-medieval font-bold text-amber-800">Data Management</h2>
          </div>
          
          <div className="p-4 space-y-2">
            <Button variant="outline" className="w-full justify-start">
              <Download className="w-4 h-4 mr-2" />
              Export All Configuration
            </Button>
            <Button variant="outline" className="w-full justify-start">
              <Upload className="w-4 h-4 mr-2" />
              Import Configuration
            </Button>
            <Button variant="outline" className="w-full justify-start text-red-600 border-red-200">
              <RefreshCw className="w-4 h-4 mr-2" />
              Reset All Progress
            </Button>
          </div>
        </div>
      </div>

      <BottomNav currentPage="Settings" />
    </div>
  );
}

function SettingLink({ icon: Icon, title, subtitle, color, isLast }) {
  return (
    <div className={`px-4 py-3 flex items-center justify-between hover:bg-amber-50 transition-colors ${!isLast ? 'border-b border-amber-100' : ''}`}>
      <div className="flex items-center gap-3">
        <div className={`w-10 h-10 rounded-lg bg-gray-100 flex items-center justify-center`}>
          <Icon className={`w-5 h-5 ${color}`} />
        </div>
        <div>
          <p className="font-medium text-gray-800">{title}</p>
          <p className="text-xs text-gray-500">{subtitle}</p>
        </div>
      </div>
      <ChevronRight className="w-5 h-5 text-gray-400" />
    </div>
  );
}