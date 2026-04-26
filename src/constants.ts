import { Product } from './types';

export const PRODUCTS: Product[] = [
  {
    id: 'whey-isolate-1',
    name: 'Whey Protein Isolate Original',
    price: 189.90,
    category: 'supplements',
    image: 'https://images.unsplash.com/photo-1593095191850-2a7330096bb7?q=80&w=1770&auto=format&fit=crop',
    variants: [
      'https://images.unsplash.com/photo-1593095191850-2a7330096bb7?q=80&w=1770&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1579722820308-d74e5719bc94?q=80&w=1770&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1594882645126-14020914d58d?q=80&w=1785&auto=format&fit=crop',
    ],
    description: 'Proteína de alta performance com 100% de pureza. Ganhos extremos e recuperação rápida.',
    tag: 'BEST SELLER',
    salesPageUrl: '' // INSIRA O LINK DA PÁGINA DE VENDAS AQUI
  },
  {
    id: 'creatine-mono-1',
    name: 'Creatina Monohidratada Original',
    price: 99.90,
    category: 'supplements',
    image: 'https://images.unsplash.com/photo-1594882645126-14020914d58d?q=80&w=1785&auto=format&fit=crop',
    variants: [
      'https://images.unsplash.com/photo-1594882645126-14020914d58d?q=80&w=1785&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1579722821110-3882740a6b6f?q=80&w=1785&auto=format&fit=crop',
    ],
    description: 'Força bruta e explosão muscular para treinos de alta intensidade.',
    salesPageUrl: '' // INSIRA O LINK DA PÁGINA DE VENDAS AQUI
  },
  {
    id: 'termogenico-extreme-1',
    name: 'Termogênico Extreme Original',
    price: 129.90,
    category: 'supplements',
    image: 'https://images.unsplash.com/photo-1550345332-09e3ac987658?q=80&w=1887&auto=format&fit=crop',
    variants: [
      'https://images.unsplash.com/photo-1550345332-09e3ac987658?q=80&w=1887&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?q=80&w=1920&auto=format&fit=crop',
    ],
    description: 'Acelere seu metabolismo e queime gordura de forma eficiente com tecnologia termogênica avançada.',
    tag: 'QUEIMA GORDURA',
    salesPageUrl: '' // INSIRA O LINK DA PÁGINA DE VENDAS AQUI
  },
  {
    id: 'bone-original-1',
    name: 'Boné Original Eu Fico Fitness - Azul',
    price: 89.90,
    category: 'apparel',
    image: '/assets/images/bone-euficofitness.jpg',
    variants: [
      '/assets/images/bone-euficofitness.jpg',
      'https://images.unsplash.com/photo-1588850561407-ed78ecf49e53?q=80&w=1920&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1556306535-38fe4adcd531?q=80&w=1920&auto=format&fit=crop'
    ],
    description: 'Boné premium azul com o logo oficial Eu Fico Fitness Original bordado. Ajuste perfeito e estilo inconfundível.',
    tag: 'NEW LOGO'
  },
  {
    id: 'camiseta-fem-1',
    name: 'Camiseta Feminina Eu Fico Fitness',
    price: 79.90,
    category: 'apparel',
    image: '/assets/images/camiseta-euficofitness.jpg',
    variants: [
      '/assets/images/camiseta-euficofitness.jpg',
      'https://images.unsplash.com/photo-1554568218-0f1715e72254?q=80&w=1887&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1512436991641-6745cdb1723f?q=80&w=1887&auto=format&fit=crop'
    ],
    description: 'Camiseta feminina premium com o nome Eu Fico Fitness Original. Conforto e elegância para seu treino.',
    tag: 'FEMININE'
  },
  {
    id: 'bcaa-recovery-1',
    name: 'BCAA 2:1:1 Alta Performance',
    price: 79.90,
    category: 'supplements',
    image: 'https://images.unsplash.com/photo-1579722822104-ca13db433107?q=80&w=1785&auto=format&fit=crop',
    variants: [
      'https://images.unsplash.com/photo-1579722822104-ca13db433107?q=80&w=1785&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1594882645126-14020914d58d?q=80&w=1785&auto=format&fit=crop',
    ],
    description: 'Aminoácidos essenciais para evitar o catabolismo muscular e acelerar a recuperação pós-treino.',
    tag: 'ESSENCIAL',
    salesPageUrl: '' 
  },
  {
    id: 'camiseta-premium-1',
    name: 'Camiseta Eu Fico Fitness Classic',
    price: 79.90,
    category: 'apparel',
    image: 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?q=80&w=1760&auto=format&fit=crop',
    variants: [
      'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?q=80&w=1760&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1554568218-0f1715e72254?q=80&w=1887&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1503342217505-b0a15ec3261c?q=80&w=1887&auto=format&fit=crop'
    ],
    description: 'Camiseta de algodão premium com o selo Eu Fico Fitness. Conforto e estilo para qualquer lugar.',
  },
  {
    id: 'camiseta-basica-black',
    name: 'Camiseta Básica Black Eu Fico Fitness',
    price: 84.90,
    category: 'apparel',
    image: '/assets/images/camisabasicablack_euficofitness.png',
    variants: [
      '/assets/images/camisabasicablack_euficofitness.png',
      'https://images.unsplash.com/photo-1618354691373-d851c5c3a990?q=80&w=1760&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1491336477066-31156b5e4f35?q=80&w=1760&auto=format&fit=crop'
    ],
    description: 'Camiseta preta básica premium com a logo circular Eu Fico Fitness Original. O equilíbrio perfeito entre o casual e o fitness.',
    tag: 'NEW ARRIVAL'
  },
  {
    id: 'camiseta-performance-original',
    name: 'Camiseta Original Performance (Selo Original)',
    price: 94.90,
    category: 'apparel',
    image: 'https://images.unsplash.com/photo-1583454110551-21f2fa2adfcd?q=80&w=2070&auto=format&fit=crop',
    variants: [
      'https://images.unsplash.com/photo-1583454110551-21f2fa2adfcd?q=80&w=2070&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1548332440-ae9685603f90?q=80&w=2070&auto=format&fit=crop'
    ],
    description: 'A camiseta oficial do time! Estampa frontal "Eu Fico Fitness Original" em ambiente real de treino. Tecnologia dry-fit premium.',
    tag: 'CINEMATIC'
  },
  {
    id: 'regata-treino-1',
    name: 'Regata Cavada Eu Fico Fitness',
    price: 64.90,
    category: 'apparel',
    image: 'https://images.unsplash.com/photo-1542513217-0b0eed3a16ad?q=80&w=1887&auto=format&fit=crop',
    variants: [
      'https://images.unsplash.com/photo-1542513217-0b0eed3a16ad?q=80&w=1887&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1550345332-09e3ac987658?q=80&w=1887&auto=format&fit=crop'
    ],
    description: 'Máxima amplitude de movimento para treinos de dorsais e ombros.',
  }
];
