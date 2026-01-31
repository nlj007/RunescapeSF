import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Map, 
  Plus, 
  ArrowLeft, 
  Trash2, 
  Edit2, 
  Save,
  X,
  MapPin
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

const themes = [
  { value: 'varrock', label: 'Varrock', color: '#8B4513' },
  { value: 'lumbridge', label: 'Lumbridge', color: '#228B22' },
  { value: 'falador', label: 'Falador', color: '#4169E1' },
  { value: 'wilderness', label: 'Wilderness', color: '#2F2F2F' },
  { value: 'camelot', label: 'Camelot', color: '#9932CC' },
  { value: 'ardougne', label: 'Ardougne', color: '#DC143C' }
];

const defaultZone = {
  name: '',
  description: '',
  theme: 'lumbridge',
  color: '#228B22',
  points_reward: 100,
  center_lat: 37.7749,
  center_lng: -122.4194,
  boundary: ''
};

export default function ZoneEditor() {
  const queryClient = useQueryClient();
  const [editingZone, setEditingZone] = useState(null);
  const [showDialog, setShowDialog] = useState(false);
  const [deleteZone, setDeleteZone] = useState(null);
  const [boundaryInput, setBoundaryInput] = useState('');

  const { data: zones = [], isLoading } = useQuery({
    queryKey: ['zones'],
    queryFn: () => base44.entities.Zone.list()
  });

  const createMutation = useMutation({
    mutationFn: (data) => base44.entities.Zone.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['zones'] });
      setShowDialog(false);
      setEditingZone(null);
    }
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }) => base44.entities.Zone.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['zones'] });
      setShowDialog(false);
      setEditingZone(null);
    }
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => base44.entities.Zone.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['zones'] });
      setDeleteZone(null);
    }
  });

  const openNewZone = () => {
    setEditingZone({ ...defaultZone });
    setBoundaryInput('');
    setShowDialog(true);
  };

  const openEditZone = (zone) => {
    setEditingZone({ ...zone });
    setBoundaryInput(typeof zone.boundary === 'string' ? zone.boundary : JSON.stringify(zone.boundary, null, 2));
    setShowDialog(true);
  };

  const handleSave = () => {
    const zoneData = {
      ...editingZone,
      boundary: boundaryInput
    };

    if (editingZone.id) {
      updateMutation.mutate({ id: editingZone.id, data: zoneData });
    } else {
      createMutation.mutate(zoneData);
    }
  };

  const handleThemeChange = (theme) => {
    const themeConfig = themes.find(t => t.value === theme);
    setEditingZone({
      ...editingZone,
      theme,
      color: themeConfig?.color || '#666666'
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-amber-50 to-amber-100">
      {/* Header */}
      <div className="bg-gradient-to-r from-amber-700 to-amber-800 px-4 py-4 shadow-lg flex items-center gap-4">
        <Link to={createPageUrl('Settings')}>
          <Button variant="ghost" size="icon" className="text-amber-100 hover:bg-amber-600">
            <ArrowLeft className="w-5 h-5" />
          </Button>
        </Link>
        <div className="flex-1">
          <h1 className="text-xl font-medieval font-bold text-amber-100 flex items-center gap-2">
            <Map className="w-5 h-5" />
            Zone Editor
          </h1>
          <p className="text-amber-200/70 text-sm">{zones.length} zones configured</p>
        </div>
        <Button 
          onClick={openNewZone}
          className="bg-amber-500 hover:bg-amber-600"
        >
          <Plus className="w-4 h-4 mr-2" />
          Add Zone
        </Button>
      </div>

      {/* Zone List */}
      <div className="p-4 space-y-3">
        {isLoading ? (
          <div className="text-center py-8">
            <div className="w-8 h-8 border-2 border-amber-600 border-t-transparent rounded-full animate-spin mx-auto" />
          </div>
        ) : zones.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-xl border border-amber-200">
            <Map className="w-12 h-12 text-amber-300 mx-auto" />
            <p className="text-amber-800 font-medieval mt-4">No zones configured</p>
            <p className="text-amber-600 text-sm mt-1">Add zones to define explorable regions</p>
            <Button onClick={openNewZone} className="mt-4">
              <Plus className="w-4 h-4 mr-2" />
              Create First Zone
            </Button>
          </div>
        ) : (
          zones.map((zone) => (
            <motion.div
              key={zone.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white rounded-xl border border-amber-200 overflow-hidden"
            >
              <div className="p-4 flex items-start gap-4">
                <div 
                  className="w-12 h-12 rounded-lg flex items-center justify-center flex-shrink-0"
                  style={{ backgroundColor: zone.color + '30', borderColor: zone.color, borderWidth: 2 }}
                >
                  <Map className="w-6 h-6" style={{ color: zone.color }} />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <h3 className="font-medieval font-bold text-amber-800">{zone.name}</h3>
                    {zone.unlocked && (
                      <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full">
                        Unlocked
                      </span>
                    )}
                  </div>
                  <p className="text-sm text-gray-500 mt-1 line-clamp-2">{zone.description || 'No description'}</p>
                  <div className="flex items-center gap-3 mt-2 text-xs text-gray-400">
                    <span className="capitalize">{zone.theme} theme</span>
                    <span>+{zone.points_reward || 0} XP</span>
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button 
                    variant="ghost" 
                    size="icon"
                    onClick={() => openEditZone(zone)}
                  >
                    <Edit2 className="w-4 h-4 text-amber-600" />
                  </Button>
                  <Button 
                    variant="ghost" 
                    size="icon"
                    onClick={() => setDeleteZone(zone)}
                  >
                    <Trash2 className="w-4 h-4 text-red-500" />
                  </Button>
                </div>
              </div>
            </motion.div>
          ))
        )}
      </div>

      {/* Edit Dialog */}
      <Dialog open={showDialog} onOpenChange={setShowDialog}>
        <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="font-medieval">
              {editingZone?.id ? 'Edit Zone' : 'New Zone'}
            </DialogTitle>
          </DialogHeader>
          
          {editingZone && (
            <div className="space-y-4">
              <div>
                <Label>Zone Name</Label>
                <Input
                  value={editingZone.name}
                  onChange={(e) => setEditingZone({ ...editingZone, name: e.target.value })}
                  placeholder="e.g., Varrock District"
                />
              </div>

              <div>
                <Label>Description</Label>
                <Textarea
                  value={editingZone.description}
                  onChange={(e) => setEditingZone({ ...editingZone, description: e.target.value })}
                  placeholder="A brief description of this zone..."
                  rows={3}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Theme</Label>
                  <Select
                    value={editingZone.theme}
                    onValueChange={handleThemeChange}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {themes.map(theme => (
                        <SelectItem key={theme.value} value={theme.value}>
                          <div className="flex items-center gap-2">
                            <div 
                              className="w-3 h-3 rounded-full"
                              style={{ backgroundColor: theme.color }}
                            />
                            {theme.label}
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label>XP Reward</Label>
                  <Input
                    type="number"
                    value={editingZone.points_reward}
                    onChange={(e) => setEditingZone({ ...editingZone, points_reward: parseInt(e.target.value) || 0 })}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Center Latitude</Label>
                  <Input
                    type="number"
                    step="0.0001"
                    value={editingZone.center_lat}
                    onChange={(e) => setEditingZone({ ...editingZone, center_lat: parseFloat(e.target.value) || 0 })}
                  />
                </div>
                <div>
                  <Label>Center Longitude</Label>
                  <Input
                    type="number"
                    step="0.0001"
                    value={editingZone.center_lng}
                    onChange={(e) => setEditingZone({ ...editingZone, center_lng: parseFloat(e.target.value) || 0 })}
                  />
                </div>
              </div>

              <div>
                <Label>Boundary (GeoJSON)</Label>
                <Textarea
                  value={boundaryInput}
                  onChange={(e) => setBoundaryInput(e.target.value)}
                  placeholder='{"type": "Polygon", "coordinates": [[[lng, lat], ...]]}'
                  rows={5}
                  className="font-mono text-xs"
                />
                <p className="text-xs text-gray-500 mt-1">
                  Enter GeoJSON polygon coordinates or use a tool like geojson.io
                </p>
              </div>
            </div>
          )}

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowDialog(false)}>
              Cancel
            </Button>
            <Button 
              onClick={handleSave}
              disabled={createMutation.isPending || updateMutation.isPending}
            >
              <Save className="w-4 h-4 mr-2" />
              Save Zone
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation */}
      <AlertDialog open={!!deleteZone} onOpenChange={() => setDeleteZone(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Zone?</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete "{deleteZone?.name}"? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction 
              className="bg-red-600"
              onClick={() => deleteMutation.mutate(deleteZone.id)}
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}