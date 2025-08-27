"use client";

import { useState, useCallback } from 'react';

interface ButtonAnimationState {
  isHovered: boolean;
  isPressed: boolean;
  isLoading: boolean;
}

export const useButtonAnimation = () => {
  const [state, setState] = useState<ButtonAnimationState>({
    isHovered: false,
    isPressed: false,
    isLoading: false
  });

  const handleMouseEnter = useCallback(() => {
    setState(prev => ({ ...prev, isHovered: true }));
  }, []);

  const handleMouseLeave = useCallback(() => {
    setState(prev => ({ ...prev, isHovered: false, isPressed: false }));
  }, []);

  const handleMouseDown = useCallback(() => {
    setState(prev => ({ ...prev, isPressed: true }));
  }, []);

  const handleMouseUp = useCallback(() => {
    setState(prev => ({ ...prev, isPressed: false }));
  }, []);

  const setLoading = useCallback((loading: boolean) => {
    setState(prev => ({ ...prev, isLoading: loading }));
  }, []);

  const getAnimationClasses = useCallback(() => {
    const baseClasses = 'transition-all duration-200 ease-out';
    const scaleClass = state.isPressed ? 'scale-95' : state.isHovered ? 'scale-105' : 'scale-100';
    const shadowClass = state.isHovered ? 'shadow-xl' : 'shadow-lg';
    const loadingClass = state.isLoading ? 'opacity-75 cursor-not-allowed' : '';
    
    return `${baseClasses} ${scaleClass} ${shadowClass} ${loadingClass}`.trim();
  }, [state]);

  const eventHandlers = {
    onMouseEnter: handleMouseEnter,
    onMouseLeave: handleMouseLeave,
    onMouseDown: handleMouseDown,
    onMouseUp: handleMouseUp,
  };

  return {
    state,
    setLoading,
    getAnimationClasses,
    eventHandlers
  };
};
