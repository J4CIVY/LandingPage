"use client";

import React, { forwardRef } from 'react';
import { useTextAnimation } from '@/hooks/useTextAnimation';

interface AnimatedTextProps extends React.HTMLAttributes<HTMLElement> {
  as?: 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6' | 'p' | 'span' | 'div' | 'li';
  animationType?: 'fadeIn' | 'slideUp' | 'slideInLeft' | 'slideInRight' | 'scaleIn';
  delay?: number;
  children: React.ReactNode;
  className?: string;
}

export const AnimatedText = forwardRef<HTMLElement, AnimatedTextProps>(
  ({ 
    as = 'div', 
    animationType = 'fadeIn', 
    delay = 0, 
    children, 
    className = '', 
    ...props 
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  }, forwardedRef) => {
    const { ref, className: animationClassName } = useTextAnimation({
      animationType,
      delay,
      triggerOnce: true,
      threshold: 0.1
    });

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const Component = as as any;
    const combinedClassName = `${animationClassName} ${className}`.trim();

    return (
      <Component
        ref={ref}
        className={combinedClassName}
        {...props}
      >
        {children}
      </Component>
    );
  }
);

AnimatedText.displayName = 'AnimatedText';

// Componentes específicos para diferentes tipos de texto
export const AnimatedHeading = forwardRef<HTMLHeadingElement, Omit<AnimatedTextProps, 'as'> & { level?: 1 | 2 | 3 | 4 | 5 | 6 }>(
  ({ level = 2, animationType = 'fadeIn', delay = 0, ...props }, ref) => (
    <AnimatedText
      ref={ref}
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      as={`h${level}` as any}
      animationType={animationType}
      delay={delay}
      {...props}
    />
  )
);

AnimatedHeading.displayName = 'AnimatedHeading';

export const AnimatedParagraph = forwardRef<HTMLParagraphElement, Omit<AnimatedTextProps, 'as'>>(
  ({ animationType = 'fadeIn', delay = 0, ...props }, ref) => (
    <AnimatedText
      ref={ref}
      as="p"
      animationType={animationType}
      delay={delay}
      {...props}
    />
  )
);

AnimatedParagraph.displayName = 'AnimatedParagraph';

export const AnimatedSpan = forwardRef<HTMLSpanElement, Omit<AnimatedTextProps, 'as'>>(
  ({ animationType = 'fadeIn', ...props }, ref) => (
    <AnimatedText
      ref={ref}
      as="span"
      animationType={animationType}
      {...props}
    />
  )
);

AnimatedSpan.displayName = 'AnimatedSpan';

// Componente para listas de texto animadas con stagger
interface AnimatedListProps {
  items: string[];
  as?: 'ul' | 'ol';
  itemClassName?: string;
  animationType?: 'fadeIn' | 'slideUp' | 'slideInLeft' | 'slideInRight' | 'scaleIn';
  staggerDelay?: number;
  className?: string;
}

export const AnimatedList: React.FC<AnimatedListProps> = ({
  items,
  as = 'ul',
  itemClassName = '',
  animationType = 'slideUp',
  staggerDelay = 100,
  className = ''
}) => {
  const Component = as;

  return (
    <Component className={className}>
      {items.map((item, index) => (
        <AnimatedText
          key={index}
          as="li"
          animationType={animationType}
          delay={index * staggerDelay}
          className={itemClassName}
        >
          {item}
        </AnimatedText>
      ))}
    </Component>
  );
};
