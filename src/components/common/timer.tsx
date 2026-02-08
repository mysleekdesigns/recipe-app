"use client";

import { useReducer, useRef, useEffect, useState, useCallback } from "react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Play,
  Pause,
  RotateCcw,
  Trash2,
  Plus,
  Timer as TimerIcon,
} from "lucide-react";

// --- Types ---

interface Timer {
  id: string;
  label: string;
  totalSeconds: number;
  remainingSeconds: number;
  isRunning: boolean;
  isComplete: boolean;
}

type TimerAction =
  | {
      type: "ADD_TIMER";
      payload: { label: string; minutes: number; seconds: number };
    }
  | { type: "REMOVE_TIMER"; payload: { id: string } }
  | { type: "TOGGLE_TIMER"; payload: { id: string } }
  | { type: "RESET_TIMER"; payload: { id: string } }
  | { type: "TICK"; payload: { id: string } }
  | { type: "COMPLETE_TIMER"; payload: { id: string } };

// --- Reducer ---

function timerReducer(state: Timer[], action: TimerAction): Timer[] {
  switch (action.type) {
    case "ADD_TIMER": {
      const totalSeconds =
        action.payload.minutes * 60 + action.payload.seconds;
      if (totalSeconds <= 0) return state;
      const newTimer: Timer = {
        id: crypto.randomUUID(),
        label: action.payload.label || "Timer",
        totalSeconds,
        remainingSeconds: totalSeconds,
        isRunning: true,
        isComplete: false,
      };
      return [...state, newTimer];
    }
    case "REMOVE_TIMER":
      return state.filter((t) => t.id !== action.payload.id);
    case "TOGGLE_TIMER":
      return state.map((t) =>
        t.id === action.payload.id && !t.isComplete
          ? { ...t, isRunning: !t.isRunning }
          : t
      );
    case "RESET_TIMER":
      return state.map((t) =>
        t.id === action.payload.id
          ? {
              ...t,
              remainingSeconds: t.totalSeconds,
              isRunning: false,
              isComplete: false,
            }
          : t
      );
    case "TICK":
      return state.map((t) => {
        if (t.id !== action.payload.id || !t.isRunning || t.isComplete)
          return t;
        const next = t.remainingSeconds - 1;
        if (next <= 0) {
          return { ...t, remainingSeconds: 0, isRunning: false, isComplete: true };
        }
        return { ...t, remainingSeconds: next };
      });
    case "COMPLETE_TIMER":
      return state.map((t) =>
        t.id === action.payload.id
          ? { ...t, remainingSeconds: 0, isRunning: false, isComplete: true }
          : t
      );
    default:
      return state;
  }
}

// --- Audio ---

function playAlertSound() {
  try {
    const ctx = new (window.AudioContext ||
      (window as any).webkitAudioContext)();
    const oscillator = ctx.createOscillator();
    const gainNode = ctx.createGain();
    oscillator.connect(gainNode);
    gainNode.connect(ctx.destination);
    oscillator.frequency.value = 800;
    oscillator.type = "sine";
    gainNode.gain.value = 0.3;
    oscillator.start();
    setTimeout(() => {
      oscillator.stop();
      ctx.close();
    }, 500);
  } catch {
    // AudioContext not available or blocked by browser
  }
}

// --- Format ---

function formatTime(totalSeconds: number): string {
  const m = Math.floor(totalSeconds / 60);
  const s = totalSeconds % 60;
  return `${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
}

// --- TimerCard ---

function TimerCard({
  timer,
  onToggle,
  onReset,
  onRemove,
}: {
  timer: Timer;
  onToggle: () => void;
  onReset: () => void;
  onRemove: () => void;
}) {
  return (
    <div
      className={cn(
        "flex items-center gap-3 rounded-lg border px-4 py-3 transition-colors",
        timer.isComplete
          ? "animate-pulse border-destructive/50 bg-destructive/10"
          : timer.isRunning
            ? "border-primary/30 bg-primary/5"
            : "bg-card"
      )}
    >
      <div className="flex-1 min-w-0">
        <p className="text-sm text-muted-foreground truncate">{timer.label}</p>
        <p
          className={cn(
            "text-2xl font-mono font-semibold tabular-nums tracking-wider",
            timer.isComplete ? "text-destructive" : "text-foreground"
          )}
        >
          {formatTime(timer.remainingSeconds)}
        </p>
      </div>

      <div className="flex items-center gap-1">
        <Button
          variant="ghost"
          size="icon-sm"
          onClick={onToggle}
          disabled={timer.isComplete}
          aria-label={timer.isRunning ? "Pause" : "Play"}
        >
          {timer.isRunning ? (
            <Pause className="size-4" />
          ) : (
            <Play className="size-4" />
          )}
        </Button>
        <Button
          variant="ghost"
          size="icon-sm"
          onClick={onReset}
          aria-label="Reset"
        >
          <RotateCcw className="size-4" />
        </Button>
        <Button
          variant="ghost"
          size="icon-sm"
          onClick={onRemove}
          aria-label="Delete"
        >
          <Trash2 className="size-4" />
        </Button>
      </div>
    </div>
  );
}

// --- TimerPanel ---

export function TimerPanel({ className }: { className?: string }) {
  const [timers, dispatch] = useReducer(timerReducer, []);
  const [showForm, setShowForm] = useState(false);
  const [minutes, setMinutes] = useState("");
  const [seconds, setSeconds] = useState("");
  const [label, setLabel] = useState("");
  const intervalsRef = useRef<Map<string, ReturnType<typeof setInterval>>>(
    new Map()
  );
  const prevTimersRef = useRef<Timer[]>([]);

  // Play sound when a timer completes
  useEffect(() => {
    for (const timer of timers) {
      const prev = prevTimersRef.current.find((t) => t.id === timer.id);
      if (timer.isComplete && prev && !prev.isComplete) {
        playAlertSound();
      }
    }
    prevTimersRef.current = timers;
  }, [timers]);

  // Manage intervals for each running timer
  useEffect(() => {
    const currentIntervals = intervalsRef.current;

    for (const timer of timers) {
      if (timer.isRunning && !currentIntervals.has(timer.id)) {
        const intervalId = setInterval(() => {
          dispatch({ type: "TICK", payload: { id: timer.id } });
        }, 1000);
        currentIntervals.set(timer.id, intervalId);
      } else if (!timer.isRunning && currentIntervals.has(timer.id)) {
        clearInterval(currentIntervals.get(timer.id));
        currentIntervals.delete(timer.id);
      }
    }

    // Clean up intervals for removed timers
    for (const [id, intervalId] of currentIntervals) {
      if (!timers.find((t) => t.id === id)) {
        clearInterval(intervalId);
        currentIntervals.delete(id);
      }
    }
  }, [timers]);

  // Cleanup all intervals on unmount
  useEffect(() => {
    const currentIntervals = intervalsRef.current;
    return () => {
      for (const intervalId of currentIntervals.values()) {
        clearInterval(intervalId);
      }
      currentIntervals.clear();
    };
  }, []);

  const handleAddTimer = useCallback(() => {
    const m = parseInt(minutes, 10) || 0;
    const s = parseInt(seconds, 10) || 0;
    if (m === 0 && s === 0) return;
    dispatch({
      type: "ADD_TIMER",
      payload: { label: label.trim() || "Timer", minutes: m, seconds: s },
    });
    setMinutes("");
    setSeconds("");
    setLabel("");
    setShowForm(false);
  }, [minutes, seconds, label]);

  return (
    <div className={cn("flex flex-col gap-3", className)}>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 text-sm font-medium text-foreground">
          <TimerIcon className="size-4 text-primary" />
          Timers
          {timers.length > 0 && (
            <span className="text-muted-foreground">({timers.length})</span>
          )}
        </div>
        {!showForm && (
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowForm(true)}
          >
            <Plus className="size-4" />
            Add Timer
          </Button>
        )}
      </div>

      {showForm && (
        <div className="flex flex-col gap-2 rounded-lg border bg-card p-3">
          <div>
            <Label htmlFor="timer-label" className="text-xs">
              Label (optional)
            </Label>
            <Input
              id="timer-label"
              type="text"
              placeholder="e.g. Boil pasta"
              value={label}
              onChange={(e) => setLabel(e.target.value)}
              className="mt-1"
            />
          </div>
          <div className="flex gap-2">
            <div className="flex-1">
              <Label htmlFor="timer-minutes" className="text-xs">
                Minutes
              </Label>
              <Input
                id="timer-minutes"
                type="number"
                min={0}
                max={99}
                placeholder="0"
                value={minutes}
                onChange={(e) => setMinutes(e.target.value)}
                className="mt-1"
              />
            </div>
            <div className="flex-1">
              <Label htmlFor="timer-seconds" className="text-xs">
                Seconds
              </Label>
              <Input
                id="timer-seconds"
                type="number"
                min={0}
                max={59}
                placeholder="0"
                value={seconds}
                onChange={(e) => setSeconds(e.target.value)}
                className="mt-1"
              />
            </div>
          </div>
          <div className="flex gap-2 pt-1">
            <Button size="sm" onClick={handleAddTimer} className="flex-1">
              Start
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => {
                setShowForm(false);
                setMinutes("");
                setSeconds("");
                setLabel("");
              }}
            >
              Cancel
            </Button>
          </div>
        </div>
      )}

      {timers.length === 0 && !showForm && (
        <p className="text-sm text-muted-foreground py-4 text-center">
          No active timers
        </p>
      )}

      <div className="flex flex-col gap-2">
        {timers.map((timer) => (
          <TimerCard
            key={timer.id}
            timer={timer}
            onToggle={() =>
              dispatch({ type: "TOGGLE_TIMER", payload: { id: timer.id } })
            }
            onReset={() =>
              dispatch({ type: "RESET_TIMER", payload: { id: timer.id } })
            }
            onRemove={() => {
              dispatch({ type: "REMOVE_TIMER", payload: { id: timer.id } });
            }}
          />
        ))}
      </div>
    </div>
  );
}

export { TimerCard };
