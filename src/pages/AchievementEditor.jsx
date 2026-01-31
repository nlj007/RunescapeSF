import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { motion } from 'framer-motion';
import { 
  Trophy, 
  Plus, 
  ArrowLeft, 
  Trash2, 
  Edit2, 
  Save,
  Map,
  MapPin,
  Navigation,
  Star,
  Calendar
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

const iconTypes = [
  { value: 'explorer', label: 'Explorer', icon: Map },
  { value: 'treasure_hunter', label: 'Treasure Hunter', icon: MapPin },
  { value: 'cartographer', label: 'Cartographer', icon: Navigation },
  { value: 'wanderer', label: 'Wanderer', icon: Navigation },
  { value: 'pioneer', label: 'Pioneer', icon: Star },
  { value: 'completionist', label: 'Completionist', icon: Trophy }
];

const requirementTypes = [
  { value: 'zones_unlocked', label: 'Zones Unlocked', unit: 'zones' },
  { value: 'pins_visited', label: 'Pins Visited', unit: 'pins' },
  { value: 'distance_traveled', label: 'Distance Traveled', unit: 'meters' },
  { value: 'days_active', label: 'Days Active', unit: 'days' }
];

const defaultAchievement = {
  title: '',
  description: '',
  icon: 'explorer',
  requirement_type: 'zones_unlocked',
  requirement_value: 1,
  points_reward: 50
};

export default function AchievementEditor() {
  const queryClient = useQueryClient();
  const [editingAchievement, setEditingAchievement] = useState(null);
  const [showDialog, setShowDialog] = useState(false);
  const [deleteAchievement, setDeleteAchievement] = useState(null);

  const { data: achievements = [], isLoading } = useQuery({
    queryKey: ['achievements'],
    queryFn: () => base44.entities.Achievement.list()
  });

  const createMutation = useMutation({
    mutationFn: (data) => base44.entities.Achievement.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['achievements'] });
      setShowDialog(false);
      setEditingAchievement(null);
    }
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }) => base44.entities.Achievement.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['achievements'] });
      setShowDialog(false);
      setEditingAchievement(null);
    }
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => base44.entities.Achievement.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['achievements'] });
      setDeleteAchievement(null);
    }
  });

  const openNewAchievement = () => {
    setEditingAchievement({ ...defaultAchievement });
    setShowDialog(true);
  };

  const openEditAchievement = (achievement) => {
    setEditingAchievement({ ...achievement });
    setShowDialog(true);
  };

  const handleSave = () => {
    if (editingAchievement.id) {
      updateMutation.mutate({ id: editingAchievement.id, data: editingAchievement });
    } else {
      createMutation.mutate(editingAchievement);
    }
  };

  const getIconConfig = (icon) => iconTypes.find(i => i.value === icon) || iconTypes[0];
  const getRequirementConfig = (type) => requirementTypes.find(r => r.value === type) || requirementTypes[0];

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
            <Trophy className="w-5 h-5" />
            Achievement Editor
          </h1>
          <p className="text-amber-200/70 text-sm">{achievements.length} achievements configured</p>
        </div>
        <Button 
          onClick={openNewAchievement}
          className="bg-amber-500 hover:bg-amber-600"
        >
          <Plus className="w-4 h-4 mr-2" />
          Add
        </Button>
      </div>

      {/* Achievement List */}
      <div className="p-4 space-y-3">
        {isLoading ? (
          <div className="text-center py-8">
            <div className="w-8 h-8 border-2 border-amber-600 border-t-transparent rounded-full animate-spin mx-auto" />
          </div>
        ) : achievements.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-xl border border-amber-200">
            <Trophy className="w-12 h-12 text-amber-300 mx-auto" />
            <p className="text-amber-800 font-medieval mt-4">No achievements configured</p>
            <p className="text-amber-600 text-sm mt-1">Add achievements to motivate exploration</p>
            <Button onClick={openNewAchievement} className="mt-4">
              <Plus className="w-4 h-4 mr-2" />
              Create First Achievement
            </Button>
          </div>
        ) : (
          achievements.map((achievement) => {
            const iconConfig = getIconConfig(achievement.icon);
            const reqConfig = getRequirementConfig(achievement.requirement_type);
            const IconComp = iconConfig.icon;
            
            return (
              <motion.div
                key={achievement.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white rounded-xl border border-amber-200 overflow-hidden"
              >
                <div className="p-4 flex items-start gap-4">
                  <div className={`w-12 h-12 rounded-lg flex items-center justify-center flex-shrink-0 ${
                    achievement.unlocked 
                      ? 'bg-gradient-to-br from-amber-400 to-amber-600' 
                      : 'bg-gray-100'
                  }`}>
                    <IconComp className={`w-6 h-6 ${achievement.unlocked ? 'text-white' : 'text-gray-400'}`} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <h3 className="font-medieval font-bold text-amber-800">{achievement.title}</h3>
                      {achievement.unlocked && (
                        <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full">
                          Unlocked
                        </span>
                      )}
                    </div>
                    <p className="text-sm text-gray-500 mt-1">{achievement.description}</p>
                    <div className="flex items-center gap-3 mt-2 text-xs text-gray-400">
                      <span>{reqConfig.label}: {achievement.requirement_value} {reqConfig.unit}</span>
                      <span>+{achievement.points_reward || 0} XP</span>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button 
                      variant="ghost" 
                      size="icon"
                      onClick={() => openEditAchievement(achievement)}
                    >
                      <Edit2 className="w-4 h-4 text-amber-600" />
                    </Button>
                    <Button 
                      variant="ghost" 
                      size="icon"
                      onClick={() => setDeleteAchievement(achievement)}
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
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle className="font-medieval">
              {editingAchievement?.id ? 'Edit Achievement' : 'New Achievement'}
            </DialogTitle>
          </DialogHeader>
          
          {editingAchievement && (
            <div className="space-y-4">
              <div>
                <Label>Achievement Title</Label>
                <Input
                  value={editingAchievement.title}
                  onChange={(e) => setEditingAchievement({ ...editingAchievement, title: e.target.value })}
                  placeholder="e.g., First Steps"
                />
              </div>

              <div>
                <Label>Description</Label>
                <Textarea
                  value={editingAchievement.description}
                  onChange={(e) => setEditingAchievement({ ...editingAchievement, description: e.target.value })}
                  placeholder="How to earn this achievement..."
                  rows={2}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Icon</Label>
                  <Select
                    value={editingAchievement.icon}
                    onValueChange={(v) => setEditingAchievement({ ...editingAchievement, icon: v })}
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
                              <TypeIcon className="w-4 h-4 text-amber-600" />
                              {type.label}
                            </div>
                          </SelectItem>
                        );
                      })}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label>XP Reward</Label>
                  <Input
                    type="number"
                    value={editingAchievement.points_reward}
                    onChange={(e) => setEditingAchievement({ ...editingAchievement, points_reward: parseInt(e.target.value) || 0 })}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Requirement Type</Label>
                  <Select
                    value={editingAchievement.requirement_type}
                    onValueChange={(v) => setEditingAchievement({ ...editingAchievement, requirement_type: v })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {requirementTypes.map(type => (
                        <SelectItem key={type.value} value={type.value}>
                          {type.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label>
                    Requirement Value ({getRequirementConfig(editingAchievement.requirement_type).unit})
                  </Label>
                  <Input
                    type="number"
                    value={editingAchievement.requirement_value}
                    onChange={(e) => setEditingAchievement({ ...editingAchievement, requirement_value: parseInt(e.target.value) || 1 })}
                  />
                </div>
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
              Save
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation */}
      <AlertDialog open={!!deleteAchievement} onOpenChange={() => setDeleteAchievement(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Achievement?</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete "{deleteAchievement?.title}"? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction 
              className="bg-red-600"
              onClick={() => deleteMutation.mutate(deleteAchievement.id)}
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}