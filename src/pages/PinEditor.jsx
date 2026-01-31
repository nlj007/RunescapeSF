import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { motion } from 'framer-motion';
import { 
  MapPin, 
  Plus, 
  ArrowLeft, 
  Trash2, 
  Edit2, 
  Save,
  Gem,
  User,
  Landmark,
  Store,
  Building2,
  AlertTriangle,
  Eye,
  Sparkles,
  ScrollText
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
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

const iconTypes = [
  { value: 'quest', label: 'Quest Marker', icon: MapPin, color: '#FFD700' },
  { value: 'treasure', label: 'Treasure', icon: Gem, color: '#9932CC' },
  { value: 'npc', label: 'NPC', icon: User, color: '#228B22' },
  { value: 'landmark', label: 'Landmark', icon: Landmark, color: '#4169E1' },
  { value: 'shop', label: 'Shop', icon: Store, color: '#FF8C00' },
  { value: 'bank', label: 'Bank', icon: Building2, color: '#FFD700' },
  { value: 'danger', label: 'Danger Zone', icon: AlertTriangle, color: '#DC143C' },
  { value: 'hidden', label: 'Hidden', icon: Eye, color: '#708090' },
  { value: 'portal', label: 'Portal', icon: Sparkles, color: '#9400D3' },
  { value: 'clue_scroll', label: 'Clue Scroll', icon: ScrollText, color: '#8B4513' }
];

const actionTypes = [
  { value: 'message', label: 'Show Message' },
  { value: 'unlock_zone', label: 'Unlock Zone' },
  { value: 'award_points', label: 'Award Points' },
  { value: 'reveal_pins', label: 'Reveal Hidden Pins' }
];

const defaultPin = {
  title: '',
  description: '',
  latitude: 37.7749,
  longitude: -122.4194,
  icon_type: 'quest',
  trigger_radius: 30,
  action_type: 'message',
  action_data: '',
  points_reward: 25,
  hidden_until_close: false
};

export default function PinEditor() {
  const queryClient = useQueryClient();
  const [editingPin, setEditingPin] = useState(null);
  const [showDialog, setShowDialog] = useState(false);
  const [deletePin, setDeletePin] = useState(null);

  const { data: pins = [], isLoading } = useQuery({
    queryKey: ['pins'],
    queryFn: () => base44.entities.Pin.list()
  });

  const createMutation = useMutation({
    mutationFn: (data) => base44.entities.Pin.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['pins'] });
      setShowDialog(false);
      setEditingPin(null);
    }
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }) => base44.entities.Pin.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['pins'] });
      setShowDialog(false);
      setEditingPin(null);
    }
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => base44.entities.Pin.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['pins'] });
      setDeletePin(null);
    }
  });

  const openNewPin = () => {
    setEditingPin({ ...defaultPin });
    setShowDialog(true);
  };

  const openEditPin = (pin) => {
    setEditingPin({ ...pin });
    setShowDialog(true);
  };

  const handleSave = () => {
    if (editingPin.id) {
      updateMutation.mutate({ id: editingPin.id, data: editingPin });
    } else {
      createMutation.mutate(editingPin);
    }
  };

  const getIconConfig = (type) => iconTypes.find(i => i.value === type) || iconTypes[0];

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
            <MapPin className="w-5 h-5" />
            Pin Editor
          </h1>
          <p className="text-amber-200/70 text-sm">{pins.length} pins configured</p>
        </div>
        <Button 
          onClick={openNewPin}
          className="bg-amber-500 hover:bg-amber-600"
        >
          <Plus className="w-4 h-4 mr-2" />
          Add Pin
        </Button>
      </div>

      {/* Pin List */}
      <div className="p-4 space-y-3">
        {isLoading ? (
          <div className="text-center py-8">
            <div className="w-8 h-8 border-2 border-amber-600 border-t-transparent rounded-full animate-spin mx-auto" />
          </div>
        ) : pins.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-xl border border-amber-200">
            <MapPin className="w-12 h-12 text-amber-300 mx-auto" />
            <p className="text-amber-800 font-medieval mt-4">No pins configured</p>
            <p className="text-amber-600 text-sm mt-1">Add pins to create points of interest</p>
            <Button onClick={openNewPin} className="mt-4">
              <Plus className="w-4 h-4 mr-2" />
              Create First Pin
            </Button>
          </div>
        ) : (
          pins.map((pin) => {
            const iconConfig = getIconConfig(pin.icon_type);
            const IconComp = iconConfig.icon;
            
            return (
              <motion.div
                key={pin.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white rounded-xl border border-amber-200 overflow-hidden"
              >
                <div className="p-4 flex items-start gap-4">
                  <div 
                    className="w-12 h-12 rounded-lg flex items-center justify-center flex-shrink-0"
                    style={{ backgroundColor: iconConfig.color + '20', borderColor: iconConfig.color, borderWidth: 2 }}
                  >
                    <IconComp className="w-6 h-6" style={{ color: iconConfig.color }} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <h3 className="font-medieval font-bold text-amber-800">{pin.title}</h3>
                      {pin.visited && (
                        <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full">
                          Visited
                        </span>
                      )}
                      {pin.hidden_until_close && (
                        <span className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full">
                          Hidden
                        </span>
                      )}
                    </div>
                    <p className="text-sm text-gray-500 mt-1 line-clamp-2 italic">"{pin.description || 'No clue text'}"</p>
                    <div className="flex items-center gap-3 mt-2 text-xs text-gray-400">
                      <span>{iconConfig.label}</span>
                      <span>{pin.trigger_radius}m radius</span>
                      <span>+{pin.points_reward || 0} XP</span>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button 
                      variant="ghost" 
                      size="icon"
                      onClick={() => openEditPin(pin)}
                    >
                      <Edit2 className="w-4 h-4 text-amber-600" />
                    </Button>
                    <Button 
                      variant="ghost" 
                      size="icon"
                      onClick={() => setDeletePin(pin)}
                    >
                      <Trash2 className="w-4 h-4 text-red-500" />
                    </Button>
                  </div>
                </div>
              </motion.div>
            );
          })
        )}
      </div>

      {/* Edit Dialog */}
      <Dialog open={showDialog} onOpenChange={setShowDialog}>
        <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="font-medieval">
              {editingPin?.id ? 'Edit Pin' : 'New Pin'}
            </DialogTitle>
          </DialogHeader>
          
          {editingPin && (
            <div className="space-y-4">
              <div>
                <Label>Pin Title</Label>
                <Input
                  value={editingPin.title}
                  onChange={(e) => setEditingPin({ ...editingPin, title: e.target.value })}
                  placeholder="e.g., Ancient Treasure"
                />
              </div>

              <div>
                <Label>Clue / Description</Label>
                <Textarea
                  value={editingPin.description}
                  onChange={(e) => setEditingPin({ ...editingPin, description: e.target.value })}
                  placeholder="A cryptic clue or description..."
                  rows={3}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Latitude</Label>
                  <Input
                    type="number"
                    step="0.00001"
                    value={editingPin.latitude}
                    onChange={(e) => setEditingPin({ ...editingPin, latitude: parseFloat(e.target.value) || 0 })}
                  />
                </div>
                <div>
                  <Label>Longitude</Label>
                  <Input
                    type="number"
                    step="0.00001"
                    value={editingPin.longitude}
                    onChange={(e) => setEditingPin({ ...editingPin, longitude: parseFloat(e.target.value) || 0 })}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Icon Type</Label>
                  <Select
                    value={editingPin.icon_type}
                    onValueChange={(v) => setEditingPin({ ...editingPin, icon_type: v })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {iconTypes.map(type => {
                        const TypeIcon = type.icon;
                        return (
                          <SelectItem key={type.value} value={type.value}>
                            <div className="flex items-center gap-2">
                              <TypeIcon className="w-4 h-4" style={{ color: type.color }} />
                              {type.label}
                            </div>
                          </SelectItem>
                        );
                      })}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label>Trigger Radius (meters)</Label>
                  <Input
                    type="number"
                    value={editingPin.trigger_radius}
                    onChange={(e) => setEditingPin({ ...editingPin, trigger_radius: parseInt(e.target.value) || 30 })}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Action Type</Label>
                  <Select
                    value={editingPin.action_type}
                    onValueChange={(v) => setEditingPin({ ...editingPin, action_type: v })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {actionTypes.map(type => (
                        <SelectItem key={type.value} value={type.value}>
                          {type.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label>XP Reward</Label>
                  <Input
                    type="number"
                    value={editingPin.points_reward}
                    onChange={(e) => setEditingPin({ ...editingPin, points_reward: parseInt(e.target.value) || 0 })}
                  />
                </div>
              </div>

              <div className="flex items-center justify-between p-3 bg-amber-50 rounded-lg">
                <div>
                  <Label>Hidden Until Close</Label>
                  <p className="text-xs text-gray-500">Only visible when within trigger radius</p>
                </div>
                <Switch
                  checked={editingPin.hidden_until_close}
                  onCheckedChange={(v) => setEditingPin({ ...editingPin, hidden_until_close: v })}
                />
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
              Save Pin
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation */}
      <AlertDialog open={!!deletePin} onOpenChange={() => setDeletePin(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Pin?</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete "{deletePin?.title}"? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction 
              className="bg-red-600"
              onClick={() => deleteMutation.mutate(deletePin.id)}
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}