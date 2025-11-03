"use client";

import { forwardRef, type ButtonHTMLAttributes, type ReactNode } from 'react';
import { useTextAnimation } from '@/hooks/useTextAnimation';
import { useButtonAnimation } from '@/hooks/useButtonAnimation';

interface AnimatedButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  as?: 'button' | 'a';
  href?: string;
  animationType?: 'fadeIn' | 'slideUp' | 'slideInLeft' | 'slideInRight' | 'scaleIn';
  delay?: number;
  children: ReactNode;
  className?: string;
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost';
}

export const AnimatedButton = forwardRef<HTMLButtonElement | HTMLAnchorElement, AnimatedButtonProps>(
  ({ 
    as = 'button',
    href,
    animationType = 'fadeIn', 
    delay = 0, 
    children, 
    className = '', 
    variant = 'primary',
    disabled,
    ...props 
  }) => {
    const { ref, className: animationClassName } = useTextAnimation({
      animationType,
      delay,
      triggerOnce: true,
      threshold: 0.1
    });

    const { getAnimationClasses, eventHandlers } = useButtonAnimation();

    const baseClasses = 'focus:outline-none focus:ring-2 focus:ring-offset-2 font-bold cursor-pointer inline-flex items-center justify-center';
    
    const variantClasses = {
      primary: 'bg-green-500 hover:bg-green-600 active:bg-green-700 text-white py-4 px-8 rounded-lg shadow-lg focus:ring-green-500',
      secondary: 'bg-red-600 hover:bg-red-700 active:bg-red-800 text-white py-4 px-8 rounded-lg shadow-lg focus:ring-red-500',
      outline: 'bg-transparent border-2 border-white hover:bg-white hover:text-black text-white py-4 px-8 rounded-lg shadow-lg focus:ring-white',
      ghost: 'bg-black/30 backdrop-blur-sm hover:bg-green-500/30 border border-white/20 hover:border-green-400/50 text-white py-2 px-4 rounded-full shadow-lg focus:ring-green-400'
    };

    const disabledClasses = disabled ? 'opacity-50 cursor-not-allowed' : '';

    const combinedClassName = `${animationClassName} ${baseClasses} ${variantClasses[variant]} ${getAnimationClasses()} ${disabledClasses} ${className}`.trim();

    const buttonEventHandlers = disabled ? {} : eventHandlers;

    if (as === 'a' && href) {
      return (
        <a
          ref={ref as React.RefObject<HTMLAnchorElement>}
          href={href}
          className={combinedClassName}
          {...buttonEventHandlers}
          {...(props as React.AnchorHTMLAttributes<HTMLAnchorElement>)}
        >
          {children}
        </a>
      );
    }

    return (
      <button
        ref={ref as React.RefObject<HTMLButtonElement>}
        className={combinedClassName}
        disabled={disabled}
        {...buttonEventHandlers}
        {...(props as ButtonHTMLAttributes<HTMLButtonElement>)}
      >
        {children}
      </button>
    );
  }
);

AnimatedButton.displayName = 'AnimatedButton';

// Componentes específicos para diferentes tipos de botones
export const AnimatedPrimaryButton = forwardRef<HTMLButtonElement, Omit<AnimatedButtonProps, 'variant'>>(
  ({ animationType = 'scaleIn', delay = 0, ...props }, ref) => (
    <AnimatedButton
      ref={ref}
      variant="primary"
      animationType={animationType}
      delay={delay}
      {...props}
    />
  )
);

AnimatedPrimaryButton.displayName = 'AnimatedPrimaryButton';

export const AnimatedSecondaryButton = forwardRef<HTMLButtonElement, Omit<AnimatedButtonProps, 'variant'>>(
  ({ animationType = 'scaleIn', delay = 0, ...props }, ref) => (
    <AnimatedButton
      ref={ref}
      variant="secondary"
      animationType={animationType}
      delay={delay}
      {...props}
    />
  )
);

AnimatedSecondaryButton.displayName = 'AnimatedSecondaryButton';

export const AnimatedOutlineButton = forwardRef<HTMLButtonElement, Omit<AnimatedButtonProps, 'variant'>>(
  ({ animationType = 'scaleIn', delay = 0, ...props }, ref) => (
    <AnimatedButton
      ref={ref}
      variant="outline"
      animationType={animationType}
      delay={delay}
      {...props}
    />
  )
);

AnimatedOutlineButton.displayName = 'AnimatedOutlineButton';

export const AnimatedGhostButton = forwardRef<HTMLButtonElement, Omit<AnimatedButtonProps, 'variant'>>(
  ({ animationType = 'scaleIn', delay = 0, ...props }, ref) => (
    <AnimatedButton
      ref={ref}
      variant="ghost"
      animationType={animationType}
      delay={delay}
      {...props}
    />
  )
);

AnimatedGhostButton.displayName = 'AnimatedGhostButton';
