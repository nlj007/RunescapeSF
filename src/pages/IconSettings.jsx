import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { 
  ArrowLeft, 
  Upload, 
  Trash2, 
  User,
  MapPin,
  Gem,
  Landmark,
  Store,
  Building2,
  AlertTriangle,
  Eye,
  Sparkles,
  ScrollText,
  Image
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

const iconFields = [
  { key: 'player_icon_url', label: 'Player Marker', icon: User, description: 'Your character on the map' },
  { key: 'quest_icon_url', label: 'Quest Pin', icon: MapPin, description: 'Quest marker pins' },
  { key: 'treasure_icon_url', label: 'Treasure Pin', icon: Gem, description: 'Treasure chest pins' },
  { key: 'npc_icon_url', label: 'NPC Pin', icon: User, description: 'NPC character pins' },
  { key: 'landmark_icon_url', label: 'Landmark Pin', icon: Landmark, description: 'Landmark/building pins' },
  { key: 'shop_icon_url', label: 'Shop Pin', icon: Store, description: 'Shop/store pins' },
  { key: 'bank_icon_url', label: 'Bank Pin', icon: Building2, description: 'Bank pins' },
  { key: 'danger_icon_url', label: 'Danger Pin', icon: AlertTriangle, description: 'Danger zone pins' },
  { key: 'hidden_icon_url', label: 'Hidden Pin', icon: Eye, description: 'Hidden/secret pins' },
  { key: 'portal_icon_url', label: 'Portal Pin', icon: Sparkles, description: 'Portal/teleport pins' },
  { key: 'clue_scroll_icon_url', label: 'Clue Scroll Pin', icon: ScrollText, description: 'Clue scroll pins' }
];

export default function IconSettings() {
  const queryClient = useQueryClient();
  const [uploading, setUploading] = useState(null);

  const { data: settings } = useQuery({
    queryKey: ['appSettings'],
    queryFn: async () => {
      const list = await base44.entities.AppSettings.list();
      return list[0] || {};
    }
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

  const handleFileUpload = async (key, file) => {
    if (!file) return;
    
    setUploading(key);
    const { file_url } = await base44.integrations.Core.UploadFile({ file });
    updateSettingsMutation.mutate({ ...settings, [key]: file_url });
    setUploading(null);
  };

  const handleUrlChange = (key, url) => {
    updateSettingsMutation.mutate({ ...settings, [key]: url });
  };

  const handleRemoveIcon = (key) => {
    const newSettings = { ...settings };
    delete newSettings[key];
    updateSettingsMutation.mutate(newSettings);
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-amber-50 to-amber-100 pb-8">
      {/* Header */}
      <div className="bg-gradient-to-r from-amber-700 to-amber-800 px-4 py-4 shadow-lg flex items-center gap-4">
        <Link to={createPageUrl('Settings')}>
          <Button variant="ghost" size="icon" className="text-amber-100 hover:bg-amber-600">
            <ArrowLeft className="w-5 h-5" />
          </Button>
        </Link>
        <div className="flex-1">
          <h1 className="text-xl font-medieval font-bold text-amber-100 flex items-center gap-2">
            <Image className="w-5 h-5" />
            Custom Icons
          </h1>
          <p className="text-amber-200/70 text-sm">Upload your own pixel art icons</p>
        </div>
      </div>

      {/* Instructions */}
      <div className="px-4 py-4">
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 text-sm text-blue-800">
          <p className="font-medium mb-1">Recommended specifications:</p>
          <ul className="list-disc list-inside text-blue-700 space-y-1">
            <li>PNG format with transparent background</li>
            <li>40x40 pixels for best results</li>
            <li>Pixel art style renders with crisp edges</li>
          </ul>
        </div>
      </div>

      {/* Icon List */}
      <div className="px-4 space-y-4">
        {iconFields.map(({ key, label, icon: Icon, description }) => (
          <div key={key} className="bg-white rounded-xl border border-amber-200 overflow-hidden">
            <div className="p-4">
              <div className="flex items-start gap-4">
                {/* Preview */}
                <div className="w-16 h-16 rounded-lg bg-gray-100 border-2 border-dashed border-gray-300 flex items-center justify-center flex-shrink-0 overflow-hidden">
                  {settings?.[key] ? (
                    <img 
                      src={settings[key]} 
                      alt={label}
                      className="w-12 h-12 object-contain"
                      style={{ imageRendering: 'pixelated' }}
                    />
                  ) : (
                    <Icon className="w-6 h-6 text-gray-400" />
                  )}
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <h3 className="font-medieval font-bold text-amber-800">{label}</h3>
                  <p className="text-xs text-gray-500 mt-0.5">{description}</p>
                  
                  {/* URL Input */}
                  <div className="mt-2">
                    <Input
                      placeholder="Paste image URL or upload below"
                      value={settings?.[key] || ''}
                      onChange={(e) => handleUrlChange(key, e.target.value)}
                      className="text-xs h-8"
                    />
                  </div>

                  {/* Actions */}
                  <div className="flex gap-2 mt-2">
                    <Label className="cursor-pointer">
                      <input
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={(e) => handleFileUpload(key, e.target.files?.[0])}
                      />
                      <Button
                        variant="outline"
                        size="sm"
                        className="h-7 text-xs"
                        disabled={uploading === key}
                        asChild
                      >
                        <span>
                          <Upload className="w-3 h-3 mr-1" />
                          {uploading === key ? 'Uploading...' : 'Upload'}
                        </span>
                      </Button>
                    </Label>
                    
                    {settings?.[key] && (
                      <Button
                        variant="outline"
                        size="sm"
                        className="h-7 text-xs text-red-600 border-red-200"
                        onClick={() => handleRemoveIcon(key)}
                      >
                        <Trash2 className="w-3 h-3 mr-1" />
                        Remove
                      </Button>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}