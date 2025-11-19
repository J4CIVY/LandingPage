"use client";

import { type FC, type ReactNode, type HTMLAttributes } from 'react';
import { useTextAnimation } from '@/hooks/useTextAnimation';

interface AnimatedTextProps extends HTMLAttributes<HTMLElement> {
  as?: 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6' | 'p' | 'span' | 'div' | 'li';
  animationType?: 'fadeIn' | 'slideUp' | 'slideInLeft' | 'slideInRight' | 'scaleIn';
  delay?: number;
  children: ReactNode;
  className?: string;
}

export const AnimatedText = ({ 
  as = 'div', 
  animationType = 'fadeIn', 
  delay = 0, 
  children, 
  className = '', 
  ...props 
}: AnimatedTextProps) => {
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
};

AnimatedText.displayName = 'AnimatedText';

// Componentes específicos para diferentes tipos de texto
export const AnimatedHeading = ({ 
  level = 2, 
  animationType = 'fadeIn', 
  delay = 0, 
  ...props 
}: Omit<AnimatedTextProps, 'as'> & { level?: 1 | 2 | 3 | 4 | 5 | 6 }) => (
  <AnimatedText
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    as={`h${level}` as any}
    animationType={animationType}
    delay={delay}
    {...props}
  />
);

AnimatedHeading.displayName = 'AnimatedHeading';

export const AnimatedParagraph = ({ 
  animationType = 'fadeIn', 
  delay = 0, 
  ...props 
}: Omit<AnimatedTextProps, 'as'>) => (
  <AnimatedText
    as="p"
    animationType={animationType}
    delay={delay}
    {...props}
  />
);

AnimatedParagraph.displayName = 'AnimatedParagraph';

export const AnimatedSpan = ({ 
  animationType = 'fadeIn', 
  ...props 
}: Omit<AnimatedTextProps, 'as'>) => (
  <AnimatedText
    as="span"
    animationType={animationType}
    {...props}
  />
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

export const AnimatedList: FC<AnimatedListProps> = ({
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
