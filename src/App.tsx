/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useMemo, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ShoppingCart, Menu, X, ArrowRight, Dumbbell, Shirt, Zap, Instagram, Facebook, Youtube, CreditCard, QrCode, Copy, CheckCircle2, LayoutDashboard, UserPlus, Users, Activity, TrendingUp, DollarSign, LogIn, LogOut, User as UserIcon, ShieldAlert, Phone, Music2, MessageCircle, Printer, Download } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line } from 'recharts';
import { onAuthStateChanged, signInWithPopup, GoogleAuthProvider, signOut, User } from 'firebase/auth';
import { collection, addDoc, serverTimestamp, getDocs, query, where, orderBy, limit } from 'firebase/firestore';
import { auth, db } from './firebase';
import { PRODUCTS } from './constants';
import { Category, Product } from './types';

type View = 'home' | 'history' | 'tips' | 'reports';

const ADMIN_EMAIL = 'tonnsilva1@gmail.com';
const WHATSAPP_NUMBER = '5585981077338'; // ALTERE PARA O SEU NÚMERO (Ex: 55 + DDD + Numero)
const WHATSAPP_MESSAGE_BASE = 'Olá! Seja bem-vindo ao Eu Fico Fitness Original. Quero transformar meu corpo e gostaria de fazer o seguinte pedido:';

const APP_LOGO = "/assets/images/logo-euficofitness-new.jpg";
const TIKTOK_IMG = "/assets/images/tiktok-euficofitness.jpg";

const REPORT_DATA = [
  { name: 'Jan', sales: 4000, users: 240 },
  { name: 'Fev', sales: 3000, users: 198 },
  { name: 'Mar', sales: 2000, users: 480 },
  { name: 'Abr', sales: 2780, users: 390 },
  { name: 'Mai', sales: 1890, users: 480 },
  { name: 'Jun', sales: 2390, users: 380 },
  { name: 'Jul', sales: 3490, users: 430 },
];

export default function App() {
  const [view, setView] = useState<View>('home');
  const [activeCategory, setActiveCategory] = useState<Category | 'all'>('all');
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [cartItems, setCartItems] = useState<{ id: string; quantity: number }[]>([]);
  const [paymentStep, setPaymentStep] = useState<'cart' | 'transfer'>('cart');
  const [copied, setCopied] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const [isAuthLoading, setIsAuthLoading] = useState(true);
  const [quoteCount, setQuoteCount] = useState<number | null>(null);
  const [newsletterEmail, setNewsletterEmail] = useState('');
  const [newsletterStatus, setNewsletterStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');

  const isAdmin = useMemo(() => user?.email === ADMIN_EMAIL, [user]);

  useEffect(() => {
    if (isAdmin) {
      const fetchStats = async () => {
        try {
          const q = query(collection(db, 'quotes'));
          const snapshot = await getDocs(q);
          setQuoteCount(snapshot.size);
        } catch (err) {
          console.error("Error fetching stats:", err);
        }
      };
      fetchStats();
    }
  }, [isAdmin]);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      setIsAuthLoading(false);
    });
    return () => unsubscribe();
  }, []);

  const handleFinalizeOrder = async () => {
    if (!user) {
      const provider = new GoogleAuthProvider();
      try {
        await signInWithPopup(auth, provider);
      } catch (error) {
        console.error("Login failed:", error);
        return;
      }
    }

    const items = cartDetails.map(item => ({
      id: item.id,
      name: item.name,
      quantity: item.quantity,
      category: item.category
    }));

    try {
      // Save to Firestore first
      await addDoc(collection(db, 'quotes'), {
        customerId: auth.currentUser?.uid || user?.uid,
        customerEmail: auth.currentUser?.email || user?.email,
        items: items,
        status: 'pending',
        createdAt: serverTimestamp()
      });

      // Then open WhatsApp
      const itemsString = items.map(i => `• ${i.name} (${i.quantity}x)`).join('\n');
      const message = `${WHATSAPP_MESSAGE_BASE}\n\n*Meus itens:*\n${itemsString}\n\n_E-mail do cliente: ${auth.currentUser?.email}_`;
      window.open(`https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(message)}`, '_blank');
      
      // Clear cart and reset
      setCartItems([]);
      setIsCartOpen(false);
      setPaymentStep('cart');
    } catch (error) {
      console.error("Error saving quote:", error);
      alert("Erro ao processar pedido. Tente novamente.");
    }
  };

  const handleLogin = async () => {
    const provider = new GoogleAuthProvider();
    try {
      await signInWithPopup(auth, provider);
    } catch (error) {
      console.error("Login failed:", error);
    }
  };

  const handleLogout = () => {
    signOut(auth);
    setView('home');
  };

  const handleNewsletterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newsletterEmail) return;
    setNewsletterStatus('loading');
    try {
      await addDoc(collection(db, 'newsletter'), {
        email: newsletterEmail,
        createdAt: serverTimestamp()
      });
      setNewsletterStatus('success');
      setNewsletterEmail('');
      setTimeout(() => setNewsletterStatus('idle'), 3000);
    } catch (error) {
      console.error("Newsletter error:", error);
      setNewsletterStatus('error');
      setTimeout(() => setNewsletterStatus('idle'), 3000);
    }
  };

  const cartDetails = useMemo(() => {
    return cartItems.map(item => ({
      ...PRODUCTS.find(p => p.id === item.id)!,
      quantity: item.quantity
    }));
  }, [cartItems]);

  const totalCartPrice = cartDetails.reduce((acc, item) => acc + (item.price * item.quantity), 0);
  const totalCartItems = cartItems.reduce((acc, item) => acc + item.quantity, 0);

  const addToCart = (productId: string) => {
    setCartItems((prev) => {
      const existing = prev.find((item) => item.id === productId);
      if (existing) {
        return prev.map((item) => 
          item.id === productId ? { ...item, quantity: item.quantity + 1 } : item
        );
      }
      return [...prev, { id: productId, quantity: 1 }];
    });
    setIsCartOpen(true);
  };

  const removeFromCart = (productId: string) => {
    setCartItems(prev => prev.filter(item => item.id !== productId));
  };

  const handleCopyPix = () => {
    navigator.clipboard.writeText('00020126330014BR.GOV.BCB.PIX0111041926082026520400005303986540510.005802BR5915EUFICOFITNESS6008BRASILIA62070503***6304E2D');
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const filteredProducts = useMemo(() => {
    if (activeCategory === 'all') return PRODUCTS;
    return PRODUCTS.filter((p) => p.category === activeCategory);
  }, [activeCategory]);

  return (
    <div className="min-h-screen bg-fitness-charcoal text-white selection:bg-primary-pink selection:text-white overflow-x-hidden">
      {/* Navigation */}
      <nav className="fixed top-0 w-full z-50 bg-fitness-charcoal/80 backdrop-blur-md border-b-2 border-white/10 px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 relative rounded-full overflow-hidden flex items-center justify-center border-2 border-white/10 shadow-lg shrink-0">
            <img 
              src={`${APP_LOGO}?t=${new Date().getTime()}`} 
              alt="Eu Fico Fitness Logo" 
              className="w-full h-full object-contain"
              referrerPolicy="no-referrer"
            />
          </div>
          <span className="font-display text-2xl tracking-tighter uppercase italic flex items-baseline gap-1">
            <span className="text-primary-pink">EU</span> 
            <span className="text-soft-blue">FICO</span> 
            <span className="text-brand-gray">FITNESS</span>
            <span className="font-sans font-light text-xs tracking-[0.2em] ml-1 opacity-80">ORIGINAL</span>
          </span>
        </div>

        {/* Desktop Nav */}
        <div className="hidden md:flex items-center gap-8 font-semibold text-sm uppercase tracking-widest">
          <button 
            onClick={() => setView('home')}
            className={`hover:text-primary-pink transition-colors ${view === 'home' ? 'text-primary-pink' : ''}`}
          >
            Loja
          </button>
          <button 
            onClick={() => setView('history')}
            className={`hover:text-primary-pink transition-colors ${view === 'history' ? 'text-primary-pink' : ''}`}
          >
            História
          </button>
          <button 
            onClick={() => setView('tips')}
            className={`hover:text-primary-pink transition-colors ${view === 'tips' ? 'text-primary-pink' : ''}`}
          >
            Dicas
          </button>
          <a 
            href="https://www.tiktok.com/@euficofitness" 
            target="_blank" 
            rel="noopener noreferrer"
            className="hover:text-primary-pink transition-colors flex items-center gap-2"
          >
            <Music2 size={16} /> TikTok
          </a>
          {isAdmin && (
            <button 
              onClick={() => setView('reports')}
              className={`hover:text-primary-pink transition-colors ${view === 'reports' ? 'text-primary-pink' : ''}`}
            >
              Relatórios
            </button>
          )}
        </div>

        <div className="flex items-center gap-4">
          {user ? (
            <div className="hidden md:flex items-center gap-3 bg-white/5 pl-2 pr-4 py-1 rounded-full border border-white/10 group relative">
              <img 
                src={user.photoURL || ''} 
                alt={user.displayName || ''} 
                className="w-8 h-8 rounded-full border border-soft-blue" 
                referrerPolicy="no-referrer"
              />
              <div className="flex flex-col">
                <span className="text-[10px] font-bold text-white/40 uppercase">Admin</span>
                <span className="text-xs font-bold leading-none">{user.displayName?.split(' ')[0]}</span>
              </div>
              <button 
                onClick={handleLogout}
                className="ml-2 p-2 hover:text-primary-pink transition-colors"
                title="Sair"
              >
                <LogOut size={16} />
              </button>
            </div>
          ) : (
            <button 
              onClick={handleLogin}
              className="hidden md:flex items-center gap-2 bg-primary-pink text-white px-4 py-2 text-xs font-bold uppercase transition-all hover:scale-105 active:scale-95"
            >
              <LogIn size={16} /> Admin Login
            </button>
          )}
          
          <button 
            onClick={() => setIsCartOpen(true)}
            className="relative p-2 hover:bg-white/10 rounded-full transition-colors"
          >
            <ShoppingCart size={24} />
            {totalCartItems > 0 && (
              <span className="absolute -top-1 -right-1 bg-soft-blue text-black text-[10px] font-bold w-5 h-5 flex items-center justify-center rounded-full">
                {totalCartItems}
              </span>
            )}
          </button>
          <button 
            className="md:hidden p-2 hover:bg-white/10 rounded-full transition-colors"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
          >
            {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </nav>

      {/* Cart Modal */}
      <AnimatePresence>
        {isCartOpen && (
          <div className="fixed inset-0 z-[60] flex items-center justify-end">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => { setIsCartOpen(false); setPaymentStep('cart'); }}
              className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            />
            <motion.div
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              className="relative w-full max-w-md h-full bg-fitness-charcoal border-l-2 border-white/10 shadow-2xl p-6 flex flex-col"
            >
              <div className="flex items-center justify-between mb-8">
                <h2 className="font-display text-3xl uppercase italic tracking-tighter">
                  Seu <span className="text-primary-pink">Carrinho</span>
                </h2>
                <button 
                  onClick={() => { setIsCartOpen(false); setPaymentStep('cart'); }}
                  className="p-2 hover:bg-white/10 rounded-full"
                >
                  <X size={24} />
                </button>
              </div>

              {paymentStep === 'cart' ? (
                <>
                  <div className="flex-1 overflow-y-auto space-y-6 pr-2">
                    {cartItems.length === 0 ? (
                      <div className="h-full flex flex-col items-center justify-center text-white/30 space-y-4">
                        <ShoppingCart size={64} strokeWidth={1} />
                        <p className="font-bold uppercase tracking-widest text-sm text-center px-12">
                          Seu carrinho está vazio. Hora de treinar!
                        </p>
                      </div>
                    ) : (
                      cartDetails.map((item) => (
                        <div key={item.id} className="flex gap-4 group">
                          <div className="w-24 h-24 bg-neutral-900 border border-white/10 overflow-hidden">
                            <img 
                              src={item.image} 
                              alt={item.name} 
                              className="w-full h-full object-cover" 
                              referrerPolicy="no-referrer"
                            />
                          </div>
                          <div className="flex-1">
                            <h4 className="font-display text-lg uppercase leading-none mb-1">{item.name}</h4>
                            <p className="text-white/40 text-xs mb-2 uppercase">{item.category}</p>
                            <div className="flex items-center justify-between">
                              <span className="font-bold text-soft-blue">Qtd: {item.quantity}</span>
                              <button 
                                onClick={() => removeFromCart(item.id)}
                                className="text-red-500 text-xs font-bold uppercase hover:underline"
                              >
                                Remover
                              </button>
                            </div>
                          </div>
                        </div>
                      ))
                    )}
                  </div>

                  {cartItems.length > 0 && (
                    <div className="border-t-2 border-white/10 pt-6 mt-6 space-y-4">
                      <button 
                        onClick={() => setPaymentStep('transfer')}
                        className="w-full bg-primary-pink text-white py-4 font-bold uppercase flex items-center justify-center gap-2 hover:scale-[1.02] active:scale-95 transition-transform brutalist-shadow-blue"
                      >
                        Solicitar Orçamento <ArrowRight size={20} />
                      </button>
                    </div>
                  )}
                </>
              ) : (
                <div className="flex-1 flex flex-col">
                  <button 
                    onClick={() => setPaymentStep('cart')}
                    className="text-xs font-bold uppercase text-white/40 hover:text-white flex items-center gap-1 mb-6"
                  >
                    ← Voltar ao carrinho
                  </button>
                  
                  <div className="flex-1 space-y-8">
                    <div className="bg-green-500/10 border-2 border-green-500 p-6 brutalist-shadow">
                      <h3 className="font-display text-2xl uppercase italic mb-4 flex items-center gap-2">
                        <MessageCircle size={24} className="text-green-500" />
                        Finalizar via WhatsApp
                      </h3>
                      {!user && (
                        <p className="text-[10px] font-bold text-primary-pink uppercase mb-4 animate-pulse">
                          * É necessário estar logado para enviar seu pedido.
                        </p>
                      )}
                      <p className="text-sm text-white/60 mb-6 leading-relaxed">
                        Como este é um catálogo exclusivo da marca **Eu Fico Fitness Original**, o fechamento do seu pedido é feito diretamente com nossa equipe via WhatsApp para garantir o melhor atendimento e disponibilidade.
                      </p>
                      
                      <button 
                        onClick={handleFinalizeOrder}
                        className="w-full bg-green-500 text-white py-4 font-bold uppercase flex items-center justify-center gap-2 hover:scale-[1.02] active:scale-95 transition-transform"
                      >
                       {user ? 'Enviar Pedido para Vendas' : 'Entrar para Enviar Pedido'} <MessageCircle size={20} />
                      </button>
                    </div>

                    <div className="bg-white/5 border border-white/10 p-4 rounded-lg">
                      <div className="flex items-center gap-3 mb-2">
                        <CheckCircle2 size={20} className="text-soft-blue" />
                        <span className="font-bold text-sm uppercase">Próximos Passos</span>
                      </div>
                      <ul className="text-xs text-white/40 leading-relaxed list-disc pl-4 space-y-1">
                        <li>Sua lista de interesses será enviada</li>
                        <li>Verificaremos o estoque e frete</li>
                        <li>Combinaremos a melhor forma de pagamento</li>
                      </ul>
                    </div>
                  </div>

                  <button 
                    onClick={() => { setIsCartOpen(false); setPaymentStep('cart'); }}
                    className="w-full bg-white text-black py-4 font-bold uppercase hover:bg-soft-blue transition-colors mt-auto"
                  >
                    Voltar à Loja
                  </button>
                </div>
              )}
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Mobile Menu */}
      <AnimatePresence>
        {isMenuOpen && (
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 20 }}
            className="fixed inset-0 z-40 bg-fitness-charcoal flex flex-col items-center justify-center gap-8 pt-20"
          >
            <button 
              onClick={() => { setView('home'); setIsMenuOpen(false); }}
              className={`font-display text-4xl uppercase italic ${view === 'home' ? 'text-primary-pink' : 'hover:text-primary-pink'}`}
            >
              Loja
            </button>
            <button 
              onClick={() => { setView('history'); setIsMenuOpen(false); }}
              className={`font-display text-4xl uppercase italic ${view === 'history' ? 'text-primary-pink' : 'hover:text-primary-pink'}`}
            >
              História
            </button>
            <button 
              onClick={() => { setView('tips'); setIsMenuOpen(false); }}
              className={`font-display text-4xl uppercase italic ${view === 'tips' ? 'text-primary-pink' : 'hover:text-primary-pink'}`}
            >
              Dicas
            </button>
            <a 
              href="https://www.tiktok.com/@euficofitness" 
              target="_blank" 
              rel="noopener noreferrer"
              className="font-display text-4xl uppercase italic hover:text-soft-blue flex items-center gap-3"
            >
              <Music2 size={32} /> TikTok
            </a>
            
            <div className="h-[2px] w-12 bg-white/10 my-4" />
            
            <a 
              href={`https://wa.me/${WHATSAPP_NUMBER}`} 
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 font-display text-2xl uppercase italic text-green-500"
            >
              <MessageCircle size={24} /> WhatsApp
            </a>
            
            {user ? (
              <button 
                onClick={() => { handleLogout(); setIsMenuOpen(false); }}
                className="flex items-center gap-2 font-display text-2xl uppercase italic text-red-500"
              >
                <LogOut size={24} /> Sair
              </button>
            ) : (
              <button 
                onClick={() => { handleLogin(); setIsMenuOpen(false); }}
                className="flex items-center gap-2 font-display text-2xl uppercase italic text-soft-blue"
              >
                <LogIn size={24} /> Admin Login
              </button>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      <main className="pt-24 pb-20">
        {view === 'home' && (
          <>
            {/* Hero Section */}
        <section className="relative min-h-[90vh] flex items-center overflow-hidden">
          {/* Immersive Background */}
          <div className="absolute inset-0 z-0">
            <img 
              src="https://images.unsplash.com/photo-1534438327276-14e5300c3a48?q=80&w=2070&auto=format&fit=crop" 
              alt="Gym Background" 
              className="w-full h-full object-cover grayscale brightness-[0.3]"
              referrerPolicy="no-referrer"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-fitness-charcoal via-transparent to-transparent" />
            <div className="absolute inset-0 bg-gradient-to-r from-fitness-charcoal/80 via-transparent to-transparent" />
          </div>

          <div className="relative z-10 px-6 max-w-7xl mx-auto w-full grid lg:grid-cols-2 gap-12 items-center">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
            >
              <div className="mb-6 flex items-center gap-3">
                <span className="h-[2px] w-12 bg-soft-blue" />
                <span className="text-soft-blue font-bold tracking-[0.2em] text-sm uppercase">Seu corpo. Sua transformação.</span>
              </div>
              <h1 className="font-display text-7xl md:text-[10vw] leading-[0.8] uppercase italic tracking-tighter mb-8">
                CHEGOU A <span className="text-primary-pink">SUA HORA</span> DE FICAR <br />
                <span className="text-soft-blue drop-shadow-[0_0_20px_rgba(125,211,252,0.4)]">FITNESS!</span>
              </h1>
              <p className="text-white/70 max-w-lg text-lg mb-10 leading-relaxed md:text-xl">
                Pare de adiar. Comece hoje a transformação que você sempre quis. Com produtos de qualidade, alimentação saudável e suplementação certa, você vai emagrecer, ganhar disposição e se sentir incrível!
              </p>
              <div className="flex flex-wrap gap-4">
                <button 
                  onClick={() => document.getElementById('products')?.scrollIntoView({ behavior: 'smooth' })}
                  className="bg-primary-pink text-white px-10 py-5 font-bold uppercase flex items-center gap-2 hover:scale-[1.02] active:scale-95 transition-all brutalist-shadow-blue"
                >
                  Ver Produtos <ArrowRight size={20} />
                </button>
                <button 
                  onClick={() => document.getElementById('tips')?.scrollIntoView({ behavior: 'smooth' })}
                  className="bg-white/10 backdrop-blur-md border-2 border-white/20 text-white px-10 py-5 font-bold uppercase flex items-center gap-2 hover:bg-white/20 transition-all"
                >
                  <Zap size={20} className="text-soft-blue" />
                  Dicas Fitness
                </button>
              </div>
            </motion.div>
          </div>

          {/* Floating Aesthetic Labels (Recipe 2) */}
          <div className="absolute bottom-12 right-12 hidden xl:flex flex-col items-end gap-2 text-right opacity-30">
            <span className="text-[10px] font-bold tracking-widest uppercase text-white/50">Est. 2024 / Original Brand</span>
            <span className="font-display text-4xl uppercase italic leading-none">High Performance</span>
          </div>
        </section>

        {/* Product Grid */}
        <section id="products" className="px-6 py-20 max-w-7xl mx-auto">
          <div className="flex flex-col md:flex-row md:items-end justify-between mb-16 gap-8">
            <div className="max-w-xl">
              <h2 className="font-display text-5xl md:text-7xl uppercase italic leading-none mb-4">
                EQUIPAMENTO <span className="font-sans font-light text-3xl md:text-5xl tracking-[0.1em] opacity-80">ORIGINAL</span>
              </h2>
              <p className="text-white/40">
                Selecionamos apenas o melhor para sua evolução. Do pré ao pós-treino, do vestuário ao acessório.
              </p>
            </div>
            
            <div className="flex gap-2 flex-wrap">
              {(['all', 'supplements', 'apparel'] as const).map((cat) => (
                <button
                  key={cat}
                  onClick={() => setActiveCategory(cat)}
                  className={`px-6 py-2 border-2 uppercase font-bold text-xs transition-all ${
                    activeCategory === cat 
                    ? 'bg-primary-pink text-white border-primary-pink' 
                    : 'border-white/20 text-white/50 hover:border-primary-pink hover:text-primary-pink'
                  }`}
                >
                  {cat === 'all' ? 'Tudo' : cat === 'supplements' ? 'Suplementos' : 'Vestuário'}
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-y-16 gap-x-8">
            <AnimatePresence mode="popLayout">
              {filteredProducts.map((product, idx) => (
                <motion.div
                  key={product.id}
                  layout
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  transition={{ delay: idx * 0.1 }}
                  className="group"
                >
                  <div className="relative aspect-[4/5] bg-neutral-900 overflow-hidden mb-6 border-2 border-white/10 group-hover:border-primary-pink transition-colors duration-300">
                    <img 
                      src={product.image} 
                      alt={product.name} 
                      className={`w-full h-full object-cover transition-transform duration-500 group-hover:scale-125 ${(product.id === 'bone-original-1' || product.id === 'camiseta-fem-1' || product.id === 'camiseta-performance-original') ? 'scale-110' : 'scale-100'} ${product.tag === 'CINEMATIC' ? 'brightness-90 contrast-125 saturate-110' : ''}`}
                      style={product.tag === 'CINEMATIC' ? { filter: 'contrast(1.15) brightness(0.9) saturate(1.05) hue-rotate(-2deg)' } : {}}
                      referrerPolicy="no-referrer"
                    />
                    {product.tag && (
                      <div className="absolute top-4 left-4 bg-soft-blue text-black text-[10px] font-black px-2 py-1 rotate-[-4deg]">
                        {product.tag}
                      </div>
                    )}
                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-3">
                      {product.salesPageUrl ? (
                        <a 
                          href={product.salesPageUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="bg-primary-pink text-white px-6 py-3 font-bold uppercase text-xs flex items-center gap-2 hover:scale-110 active:scale-95 transition-transform brutalist-shadow-blue"
                          onClick={(e) => e.stopPropagation()}
                        >
                          Ir para o Vendedor <ArrowRight size={16} />
                        </a>
                      ) : (
                        <button 
                          onClick={() => addToCart(product.id)}
                          className="bg-primary-pink text-white p-4 rounded-full hover:scale-110 active:scale-90 transition-transform brutalist-shadow-blue"
                        >
                          <ShoppingCart size={24} />
                        </button>
                      )}
                    </div>
                  </div>
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <h3 className="font-display text-xl uppercase tracking-tight group-hover:text-primary-pink transition-colors">
                        {product.name}
                      </h3>
                      <p className="text-white/40 text-[10px] uppercase font-bold tracking-widest group-hover:text-soft-blue transition-colors">
                        {product.category === 'supplements' ? 'Suplementação Original' : 'Original Apparel'}
                      </p>
                    </div>
                  </div>
                  <p className="text-white/50 text-sm line-clamp-2">{product.description}</p>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        </section>

        {/* Small Tips Section (Dicas Fitness) */}
        <section id="tips" className="bg-white text-black py-20 px-6">
          <div className="max-w-7xl mx-auto">
            <h2 className="font-display text-5xl md:text-8xl uppercase italic tracking-tighter mb-12">
              Dicas <span className="text-primary-pink">Fitness</span>
            </h2>
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
              {[
                { title: 'Constância', text: 'O resultado não vem do treino perfeito, mas do treino que você não falta.', icon: Zap },
                { title: 'Alimentação', text: 'Coma limpo. Seu corpo é o reflexo do combustível que você coloca nele.', icon: Shirt },
                { title: 'Suplementação', text: 'Suplementos de alta performance são seus aliados, não substitutos. Use com foco.', icon: CreditCard },
                { title: 'Mentalidade', text: 'O corpo alcança o que a mente acredita. Mantenha o foco no objetivo.', icon: Dumbbell },
              ].map((tip, i) => (
                <div key={i} className="border-l-4 border-black pl-6 py-2">
                  <tip.icon size={32} className="mb-4 text-primary-pink" />
                  <h3 className="font-display text-2xl uppercase mb-2">{tip.title}</h3>
                  <p className="text-sm font-medium leading-relaxed opacity-70">{tip.text}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Marquee Effect */}
        <section className="py-20 overflow-hidden bg-soft-blue text-black border-y-4 border-white select-none">
          <div className="flex whitespace-nowrap animate-marquee font-display text-6xl md:text-8xl items-center gap-8">
            <span className="italic uppercase">EU FICO FITNESS</span>
            <Zap size={64} fill="black" />
            <span className="italic uppercase">TIKTOK @EUFICOFITNESS</span>
            <Dumbbell size={64} fill="black" />
            <span className="italic uppercase">LIN SUPPLEMENTS</span>
            <Shirt size={64} fill="black" />
            
            <span className="italic uppercase">EU FICO FITNESS</span>
            <Zap size={64} fill="black" />
            <span className="italic uppercase">TIKTOK @EUFICOFITNESS</span>
            <Dumbbell size={64} fill="black" />
            <span className="italic uppercase">LIN SUPPLEMENTS</span>
            <Shirt size={64} fill="black" />
          </div>
        </section>

        {/* Benefits */}
        <section className="px-6 py-24 max-w-7xl mx-auto grid md:grid-cols-3 gap-12 border-b-2 border-white/10">
          <div className="space-y-4">
            <div className="w-12 h-12 border-2 border-primary-pink flex items-center justify-center mb-6">
              <Zap size={24} className="text-primary-pink" />
            </div>
            <h4 className="font-display text-2xl uppercase italic">Pureza Lin</h4>
            <p className="text-white/40">Suplementos testados em laboratório com o mais alto grau de pureza disponível no mercado brasileiro.</p>
          </div>
          <div className="space-y-4">
            <div className="w-12 h-12 border-2 border-primary-pink flex items-center justify-center mb-6">
              <Shirt size={24} className="text-primary-pink" />
            </div>
            <h4 className="font-display text-2xl uppercase italic">Performance Wear</h4>
            <p className="text-white/40">Tecidos inteligentes que auxiliam na respiração da pele e garantem durabilidade máxima.</p>
          </div>
          <div className="space-y-4">
            <div className="w-12 h-12 border-2 border-primary-pink flex items-center justify-center mb-6">
              <Dumbbell size={24} className="text-primary-pink" />
            </div>
            <h4 className="font-display text-2xl uppercase italic">Comunidade</h4>
            <p className="text-white/40">Faça parte do time Eu Fico Fitness Original. Mais do que roupas, um estilo de vida focado em metas.</p>
          </div>
        </section>
          </>
        )}

         {/* Floating Category Drawer (Recipe 10) */}
        {view === 'home' && (
          <div className="fixed bottom-8 left-1/2 -translate-x-1/2 z-40 bg-fitness-charcoal/40 backdrop-blur-md border-2 border-white/10 p-2 rounded-full flex gap-2 brutalist-shadow shadow-primary-pink/20">
            {(['all', 'supplements', 'apparel'] as const).map((cat) => (
              <button
                key={cat}
                onClick={() => {
                  setActiveCategory(cat);
                  document.getElementById('products')?.scrollIntoView({ behavior: 'smooth' });
                }}
                className={`px-6 py-2 rounded-full uppercase font-black text-[10px] tracking-widest transition-all ${
                  activeCategory === cat 
                  ? 'bg-primary-pink text-white scale-105' 
                  : 'text-white/40 hover:text-white hover:bg-white/5'
                }`}
              >
                {cat === 'all' ? 'Tudo' : cat === 'supplements' ? 'Suplementos' : 'Roupas'}
              </button>
            ))}
          </div>
        )}

        {view === 'history' && (
          <div className="px-6 py-20 max-w-7xl mx-auto space-y-24">
            <section className="grid lg:grid-cols-2 gap-16 items-center">
              <motion.div
                initial={{ opacity: 0, x: -50 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
              >
                <div className="inline-block bg-soft-blue text-black px-3 py-1 font-bold text-xs uppercase mb-6 rotate-1">
                  Nossa História
                </div>
                <h2 className="font-display text-6xl md:text-8xl uppercase italic tracking-tighter mb-8 leading-none">
                  DO TIKTOK PARA <br />
                  <span className="text-primary-pink">O MUNDO REAL</span>
                </h2>
                <p className="text-white/70 text-lg leading-relaxed mb-6">
                  Tudo começou com um celular, uma ideia e a vontade de mostrar que a transformação fitness é possível para qualquer pessoa. Nossos primeiros vídeos no TikTok não eram sobre vender produtos, mas sobre compartilhar a jornada real. Desse esforço autêntico nasceu a marca <strong>Eu Fico Fitness Original</strong>.
                </p>
                <div className="flex gap-4 mb-8">
                  <a 
                    href="https://www.tiktok.com/@euficofitness" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="flex items-center gap-3 bg-white text-black px-6 py-3 font-bold uppercase italic hover:bg-soft-blue transition-colors rounded-sm"
                  >
                    <Music2 size={20} /> Seguir no TikTok
                  </a>
                </div>
              </motion.div>
              <a 
                href="https://www.tiktok.com/@euficofitness" 
                target="_blank" 
                rel="noopener noreferrer" 
                className="relative aspect-video lg:aspect-square bg-neutral-900 border-2 border-white/10 overflow-hidden block group"
              >
                <img 
                  src={TIKTOK_IMG} 
                  alt="TikTok Origins" 
                  className="w-full h-full object-cover scale-110 group-hover:scale-125 transition-transform duration-700"
                  referrerPolicy="no-referrer"
                />
                <div className="absolute inset-x-0 bottom-0 p-4 bg-gradient-to-t from-black/80 to-transparent">
                  <p className="text-[10px] font-bold tracking-widest uppercase text-white/70 italic-display">TikTok Community</p>
                </div>
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                  <div className="bg-white/10 backdrop-blur-sm p-4 rounded-full animate-pulse shadow-[0_0_30px_rgba(255,255,255,0.2)] w-32 h-32 group-hover:scale-110 transition-transform flex items-center justify-center overflow-hidden border-2 border-white/20">
                    <img 
                      src={APP_LOGO} 
                      alt="Brand Logo" 
                      className="w-full h-full object-cover object-[center_57%] scale-[1.35]"
                      referrerPolicy="no-referrer"
                    />
                  </div>
                </div>
              </a>
            </section>
          </div>
        )}

        {view === 'tips' && (
          <div className="px-6 py-20 max-w-7xl mx-auto space-y-24">
            <div className="text-center mb-16">
              <h2 className="font-display text-6xl md:text-8xl uppercase italic tracking-tighter mb-4">
                Dicas de <span className="text-soft-blue">Performance</span>
              </h2>
              <p className="text-white/40 uppercase tracking-widest font-bold">Protocolos oficiais Eu Fico Fitness para resultados reais.</p>
            </div>

            <div className="grid md:grid-cols-2 gap-12">
              <div className="space-y-8">
                <div className="bg-white/5 border-2 border-primary-pink p-8 brutalist-shadow">
                  <h3 className="font-display text-4xl uppercase italic mb-6 flex items-center gap-3 text-primary-pink">
                    <Activity size={32} /> Exercícios e Ciência
                  </h3>
                  <div className="space-y-8">
                    <div className="border-l-2 border-primary-pink/50 pl-6">
                      <h4 className="font-bold uppercase text-lg mb-2">Treino de Hipertrofia</h4>
                      <p className="text-white/60 text-sm mb-4 leading-relaxed">
                        Para ganho de massa, a ciência recomenda trabalhar com 60-80% de 1RM e focar na progressão de carga. De acordo com o <strong>American College of Sports Medicine (ACSM)</strong>, o treinamento de resistência é fundamental para a saúde muscular.
                      </p>
                      <a 
                        href="https://www.acsm.org/education-resources/trending-topics-resources/physical-activity-guidelines" 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="text-primary-pink text-[10px] font-black uppercase tracking-widest hover:underline flex items-center gap-2"
                      >
                        Ver Diretrizes ACSM <ArrowRight size={12} />
                      </a>
                    </div>

                    <div className="border-l-2 border-primary-pink/50 pl-6">
                      <h4 className="font-bold uppercase text-lg mb-2">Cardio Estratégico (HIIT)</h4>
                      <p className="text-white/60 text-sm mb-4 leading-relaxed">
                        Estudos da <strong>Mayo Clinic</strong> demonstram que o treinamento intervalado de alta intensidade (HIIT) é superior para queima calórica e saúde metabólica em menos tempo.
                      </p>
                      <a 
                        href="https://www.mayoclinic.org/healthy-lifestyle/fitness/in-depth/interval-training/art-20044588" 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="text-primary-pink text-[10px] font-black uppercase tracking-widest hover:underline flex items-center gap-2"
                      >
                        Estudo Mayo Clinic <ArrowRight size={12} />
                      </a>
                    </div>
                  </div>
                </div>
              </div>

              <div className="space-y-8">
                <div className="bg-white/5 border-2 border-soft-blue p-8 brutalist-shadow-blue">
                  <h3 className="font-display text-4xl uppercase italic mb-6 flex items-center gap-3 text-soft-blue">
                    <Shirt size={32} /> Nutrição e Saúde
                  </h3>
                  <div className="space-y-8">
                    <div className="border-l-2 border-soft-blue/50 pl-6">
                      <h4 className="font-bold uppercase text-lg mb-2">A Importância das Proteínas</h4>
                      <p className="text-white/60 text-sm mb-4 leading-relaxed">
                        A Sociedade Brasileira de Nutrição ressalta que o consumo adequado de proteínas (1.6g a 2.2g por kg/peso) é essencial para quem treina. Saiba mais sobre os macronutrientes no portal do <strong>Ministério da Saúde</strong>.
                      </p>
                      <a 
                        href="https://www.gov.br/saude/pt-br/assuntos/saude-brasil/eu-quero-me-alimentar-melhor" 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="text-soft-blue text-[10px] font-black uppercase tracking-widest hover:underline flex items-center gap-2"
                      >
                        Guia Alimentar Federal <ArrowRight size={12} />
                      </a>
                    </div>

                    <div className="border-l-2 border-soft-blue/50 pl-6">
                      <h4 className="font-bold uppercase text-lg mb-2">Poder da Hidratação</h4>
                      <p className="text-white/60 text-sm mb-4 leading-relaxed">
                        A <strong>Harvard Health</strong> afirma que a água é o nutriente mais ignorado. Ela regula a temperatura, lubrifica articulações e transporta nutrientes para as células.
                      </p>
                      <a 
                        href="https://www.health.harvard.edu/staying-healthy/the-importance-of-staying-hydrated" 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="text-soft-blue text-[10px] font-black uppercase tracking-widest hover:underline flex items-center gap-2"
                      >
                        Artigo Harvard Health <ArrowRight size={12} />
                      </a>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {view === 'reports' && (
          <div className="px-6 py-20 max-w-7xl mx-auto space-y-12">
            {!isAdmin ? (
              <div className="min-h-[60vh] flex flex-col items-center justify-center text-center space-y-6">
                <div className="bg-red-500/10 p-8 rounded-full border-2 border-red-500 animate-pulse">
                  <ShieldAlert size={64} className="text-red-500" />
                </div>
                <h2 className="font-display text-5xl uppercase italic tracking-tighter">
                  ACESSO <span className="text-red-500">NEGADO</span>
                </h2>
                <p className="text-white/40 max-w-md">Este dashboard é restrito exclusivamente ao dono (tonnsilva1@gmail.com).</p>
                <button 
                  onClick={handleLogin}
                  className="bg-primary-pink text-white px-8 py-4 font-bold uppercase transition-all hover:scale-105"
                >
                  Fazer Login Admin
                </button>
              </div>
            ) : (
              <AdminDashboard quoteCount={quoteCount} />
            )}
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="bg-neutral-950 px-6 py-20">
        <div className="max-w-7xl mx-auto grid md:grid-cols-4 gap-12 border-b-2 border-white/5 pb-16">
          <div className="col-span-1 md:col-span-2 space-y-8">
            <div className="flex items-center justify-center md:justify-start gap-4 flex-wrap">
              <div className="w-24 h-24 rounded-full overflow-hidden flex items-center justify-center shrink-0 border-2 border-white/10 shadow-xl">
                <img 
                  src={APP_LOGO} 
                  alt="Eu Fico Fitness Logo" 
                  className="w-full h-full object-contain"
                  referrerPolicy="no-referrer"
                />
              </div>
              <span className="font-display text-3xl tracking-tighter uppercase italic flex items-baseline gap-2 flex-wrap text-center md:text-left">
                <span className="text-primary-pink">EU</span> 
                <span className="text-soft-blue">FICO</span> 
                <span className="text-brand-gray">FITNESS</span>
                <span className="font-sans font-light text-sm tracking-[0.3em] opacity-60">ORIGINAL</span>
              </span>
            </div>
            <p className="text-brand-gray/60 max-w-sm mx-auto md:mx-0 text-center md:text-left">
              Eleve seu jogo com o lifestyle fitness original. Streetwear e suplementação de alta performance feito para quem não aceita menos que o topo.
            </p>
            <div className="flex flex-col items-center md:items-start gap-4">
              <a 
                href={`https://wa.me/${WHATSAPP_NUMBER}`} 
                target="_blank" 
                rel="noopener noreferrer" 
                className="flex items-center gap-3 text-white/60 hover:text-white transition-colors group"
              >
                <MessageCircle size={18} className="text-green-500" />
                <span>WhatsApp Vendas</span>
              </a>
              <div className="flex gap-6 pt-4 justify-center md:justify-start">
                <a href="#" className="text-white/40 hover:text-primary-pink transition-colors"><Instagram size={20} /></a>
                <a href="#" className="text-white/40 hover:text-primary-pink transition-colors"><Facebook size={20} /></a>
                <a 
                  href="https://www.tiktok.com/@euficofitness" 
                  target="_blank" 
                  rel="noopener noreferrer" 
                  className="text-white/40 hover:text-primary-pink transition-colors"
                >
                  <Music2 size={20} />
                </a>
                <a href="#" className="text-white/40 hover:text-primary-pink transition-colors"><Youtube size={20} /></a>
              </div>
            </div>
          </div>
          
          <div className="space-y-6">
            <h5 className="font-display text-xl uppercase tracking-wide">Páginas</h5>
            <ul className="space-y-4 text-white/40 font-medium text-sm">
              <li><button onClick={() => { setView('home'); window.scrollTo(0, 0); }} className="hover:text-primary-pink transition-colors">Loja</button></li>
              <li><button onClick={() => { setView('history'); window.scrollTo(0, 0); }} className="hover:text-primary-pink transition-colors">Nossa História</button></li>
              <li><button onClick={() => { setView('tips'); window.scrollTo(0, 0); }} className="hover:text-primary-pink transition-colors">Dicas de Treino</button></li>
              <li><button onClick={() => { if (isAdmin) { setView('reports'); window.scrollTo(0, 0); } else { handleLogin(); } }} className={`transition-colors ${isAdmin ? 'text-soft-blue hover:text-primary-pink' : 'text-white/20'}`}>Portal Admin {isAdmin ? '✓' : '🔒'}</button></li>
            </ul>
          </div>

          <div className="space-y-6">
            <h5 className="font-display text-xl uppercase tracking-wide">Newsletter</h5>
            <p className="text-white/40 text-sm">Receba lançamentos exclusivos e promoções direto no seu e-mail.</p>
            <form onSubmit={handleNewsletterSubmit} className="relative">
              <input 
                type="email" 
                value={newsletterEmail}
                onChange={(e) => setNewsletterEmail(e.target.value)}
                placeholder="SEU@EMAIL.COM" 
                disabled={newsletterStatus === 'loading'}
                className="w-full bg-white/5 border-2 border-white/20 p-4 focus:border-primary-pink outline-none transition-colors font-bold text-xs disabled:opacity-50"
                required
              />
              <button 
                type="submit"
                disabled={newsletterStatus === 'loading'}
                className={`absolute right-2 top-1/2 -translate-y-1/2 font-black p-2 hover:scale-105 active:scale-95 transition-transform ${
                  newsletterStatus === 'success' ? 'bg-green-500 text-white' : 'bg-primary-pink text-white'
                }`}
              >
                {newsletterStatus === 'loading' ? '...' : newsletterStatus === 'success' ? <CheckCircle2 size={18} /> : <ArrowRight size={18} />}
              </button>
            </form>
            {newsletterStatus === 'success' && <p className="text-[10px] text-green-500 font-bold uppercase">Cadastrado com sucesso!</p>}
            {newsletterStatus === 'error' && <p className="text-[10px] text-red-500 font-bold uppercase">Erro ao cadastrar.</p>}
          </div>
        </div>
        
        <div className="max-w-7xl mx-auto pt-8 flex flex-col md:flex-row items-center justify-between gap-8">
          <div className="flex flex-wrap justify-center gap-6 text-[10px] font-bold uppercase tracking-[0.2em] text-white/30">
            <button onClick={() => { setView('home'); window.scrollTo(0, 0); }} className="hover:text-white transition-colors">Início</button>
            <button onClick={() => { setView('history'); window.scrollTo(0, 0); }} className="hover:text-white transition-colors">Sobre</button>
            <button onClick={() => { setView('tips'); window.scrollTo(0, 0); }} className="hover:text-white transition-colors">Dicas</button>
            <a href="https://www.tiktok.com/@euficofitness" target="_blank" rel="noopener noreferrer" className="hover:text-white transition-colors">Social</a>
          </div>

          <div className="text-center md:text-right space-y-2">
            <div className="text-brand-gray/30 text-[10px] font-bold uppercase tracking-widest">
              © 2026 Eu Fico Fitness Original. All rights reserved.
            </div>
            <div className="text-[10px] font-bold uppercase tracking-widest opacity-50">
              Developed by <span className="text-primary-pink">Holfoman Tech</span>
            </div>
          </div>
        </div>
      </footer>

      {/* Marquee Animation Support */}
      <style>{`
        @keyframes marquee {
          0% { transform: translateX(0); }
          100% { transform: translateX(-50%); }
        }
        .animate-marquee {
          animation: marquee 20s linear infinite;
        }
        @media print {
          nav, footer, .print\:hidden {
            display: none !important;
          }
          body {
            background: white !important;
            color: black !important;
          }
          .fixed, .absolute {
            position: relative !important;
          }
        }
      `}</style>
    </div>
  );
}

function AdminDashboard({ quoteCount }: { quoteCount: number | null }) {
  const [quotes, setQuotes] = useState<any[]>([]);
  const [newsletter, setNewsletter] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [copiedReport, setCopiedReport] = useState(false);
  const [activeTab, setActiveTab] = useState<'quotes' | 'newsletter'>('quotes');

  useEffect(() => {
    const fetchData = async () => {
      try {
        const qQuotes = query(collection(db, 'quotes'), orderBy('createdAt', 'desc'), limit(100));
        const sQuotes = await getDocs(qQuotes);
        setQuotes(sQuotes.docs.map(doc => ({ id: doc.id, ...doc.data() })));

        const qNews = query(collection(db, 'newsletter'), orderBy('createdAt', 'desc'), limit(100));
        const sNews = await getDocs(qNews);
        setNewsletter(sNews.docs.map(doc => ({ id: doc.id, ...doc.data() })));
      } catch (err) {
        console.error("Error fetching data:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const uniqueCustomers = useMemo(() => {
    return new Set(quotes.map(q => q.customerEmail)).size;
  }, [quotes]);

  const totalItemsOrdered = useMemo(() => {
    return quotes.reduce((acc, q) => {
      return acc + (q.items?.reduce((sum: number, i: any) => sum + i.quantity, 0) || 0);
    }, 0);
  }, [quotes]);

  const handlePrint = () => {
    window.print();
  };

  const handleDownloadCSV = () => {
    const headers = ['Email', 'Itens', 'Data'];
    const rows = quotes.map(q => [
      q.customerEmail,
      q.items?.map((i: any) => `${i.name}(${i.quantity}x)`).join(' | '),
      q.createdAt?.toDate ? q.createdAt.toDate().toLocaleString('pt-BR') : '---'
    ]);

    const csvContent = [headers, ...rows].map(e => e.join(",")).join("\n");
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);
    link.setAttribute("href", url);
    link.setAttribute("download", `relatorio_vendas_${new Date().toLocaleDateString()}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleCopyReport = () => {
    const text = quotes.map(q => 
      `Cliente: ${q.customerEmail}\nItens: ${q.items?.map((i: any) => `${i.name}(${i.quantity}x)`).join(', ')}\nData: ${q.createdAt?.toDate ? q.createdAt.toDate().toLocaleString('pt-BR') : '---'}\n`
    ).join('\n---\n\n');
    
    navigator.clipboard.writeText(`RELATÓRIO DE PEDIDOS - EU FICO FITNESS\nTotal de Pedidos: ${quotes.length}\n\n${text}`);
    setCopiedReport(true);
    setTimeout(() => setCopiedReport(false), 2000);
  };

  const handleDownloadTXT = () => {
    const text = quotes.map(q => 
      `CLIENTE: ${q.customerEmail}\nITENS: ${q.items?.map((i: any) => `${i.name}(${i.quantity}x)`).join(', ')}\nDATA: ${q.createdAt?.toDate ? q.createdAt.toDate().toLocaleString('pt-BR') : '---'}\n`
    ).join('\n' + '='.repeat(40) + '\n\n');
    
    const content = `RELATÓRIO DE PEDIDOS - EU FICO FITNESS\nGerado em: ${new Date().toLocaleString('pt-BR')}\nTotal de Pedidos: ${quotes.length}\n\n${'='.repeat(40)}\n\n${text}`;
    
    const blob = new Blob([content], { type: 'text/plain;charset=utf-8;' });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);
    link.setAttribute("href", url);
    link.setAttribute("download", `relatorio_vendas_${new Date().toLocaleDateString()}.txt`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-12 print:text-black">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-8 print:hidden">
        <div>
          <h1 className="font-display text-4xl md:text-6xl uppercase italic tracking-tighter mb-4">
            DASHBOARD DE <span className="text-primary-pink">PERFORMANCE</span>
          </h1>
          <p className="text-white/40 uppercase text-[10px] font-bold tracking-widest text-primary-pink">Relatório Exclusivo do Proprietário</p>
        </div>
        <div className="flex flex-wrap gap-3">
          <button 
            onClick={handleCopyReport}
            className="flex items-center gap-2 bg-white/5 border border-white/10 px-4 py-2 text-[10px] font-bold uppercase hover:bg-white/10 transition-colors"
          >
            {copiedReport ? <CheckCircle2 size={14} className="text-green-500" /> : <Copy size={14} />}
            {copiedReport ? 'Copiado!' : 'Copiar Texto'}
          </button>
          <button 
            onClick={handleDownloadTXT}
            className="flex items-center gap-2 bg-white/5 border border-white/10 px-4 py-2 text-[10px] font-bold uppercase hover:bg-white/10 transition-colors"
          >
            <Download size={14} /> Baixar TXT
          </button>
          <button 
            onClick={handleDownloadCSV}
            className="flex items-center gap-2 bg-white/5 border border-white/10 px-4 py-2 text-[10px] font-bold uppercase hover:bg-white/10 transition-colors"
          >
            <Download size={14} /> Baixar CSV
          </button>
          <button 
            onClick={handlePrint}
            className="flex items-center gap-2 bg-soft-blue text-black px-4 py-2 text-[10px] font-bold uppercase hover:bg-white transition-colors"
          >
            <Printer size={14} /> Imprimir / PDF
          </button>
        </div>
      </div>

      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {[
          { label: 'Clientes Únicos', value: uniqueCustomers, change: 'Base Real', icon: Users },
          { label: 'Total de Pedidos', value: quotes.length, change: 'Histórico', icon: MessageCircle },
          { label: 'Newsletter', value: newsletter.length, change: 'Inscritos', icon: UserPlus },
          { label: 'Taxa de Conversão', value: quotes.length > 0 ? '98%' : '0%', change: 'Eficiência', icon: TrendingUp },
        ].map((stat, i) => (
          <div key={i} className="bg-white/5 border border-white/10 p-6 space-y-4 brutalist-shadow-blue hover:scale-[1.02] transition-transform print:border-black print:text-black">
            <div className="flex justify-between items-start print:hidden">
              <stat.icon size={24} className="text-soft-blue" />
              <span className="text-xs font-bold text-green-500">{stat.change}</span>
            </div>
            <div>
              <span className="text-[10px] font-bold uppercase text-white/40 block mb-1 print:text-black/60">{stat.label}</span>
              <span className="font-display text-4xl leading-none">{stat.value}</span>
            </div>
          </div>
        ))}
      </div>

      <div className="bg-white/5 border border-white/10 p-8 print:bg-transparent print:border-black print:p-0">
        <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
          <div className="flex items-center gap-6">
            <button 
              onClick={() => setActiveTab('quotes')}
              className={`font-display text-2xl uppercase italic flex items-center gap-3 transition-colors ${activeTab === 'quotes' ? 'text-primary-pink' : 'text-white/20 hover:text-white'}`}
            >
              <Users size={24} className={activeTab === 'quotes' ? 'text-primary-pink' : 'text-white/20'} />
              Log de Pedidos
            </button>
            <button 
              onClick={() => setActiveTab('newsletter')}
              className={`font-display text-2xl uppercase italic flex items-center gap-3 transition-colors ${activeTab === 'newsletter' ? 'text-soft-blue' : 'text-white/20 hover:text-white'}`}
            >
              <UserPlus size={24} className={activeTab === 'newsletter' ? 'text-soft-blue' : 'text-white/20'} />
              Inscritos Newsletter
            </button>
          </div>
        </div>

        {loading ? (
          <p className="text-white/20 animate-pulse print:hidden">Carregando dados seguros...</p>
        ) : (
          <div className="overflow-x-auto">
            {activeTab === 'quotes' ? (
              <table className="w-full text-left border-collapse min-w-[600px] print:text-black">
                <thead>
                  <tr className="border-b border-white/10 text-[10px] uppercase tracking-widest text-white/40 font-black print:border-black print:text-black">
                    <th className="pb-4">Email do Cliente</th>
                    <th className="pb-4">Itens Pedidos</th>
                    <th className="pb-4 text-right">Data e Hora</th>
                  </tr>
                </thead>
                <tbody className="text-xs">
                  {quotes.map((quote) => (
                    <tr key={quote.id} className="border-b border-white/5 hover:bg-white/5 transition-colors group print:border-black/10">
                      <td className="py-4 font-bold text-soft-blue underline decoration-dotted print:text-black">
                        <a href={`mailto:${quote.customerEmail}`} title="Enviar e-mail">
                          {quote.customerEmail}
                        </a>
                      </td>
                      <td className="py-4">
                        {quote.items?.map((item: any) => `${item.name} (${item.quantity}x)`).join(', ')}
                      </td>
                      <td className="py-4 text-right text-white/40 group-hover:text-white transition-colors print:text-black">
                        {quote.createdAt?.toDate ? new Intl.DateTimeFormat('pt-BR', { dateStyle: 'short', timeStyle: 'short' }).format(quote.createdAt.toDate()) : '---'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : (
              <table className="w-full text-left border-collapse min-w-[300px] print:text-black">
                <thead>
                  <tr className="border-b border-white/10 text-[10px] uppercase tracking-widest text-white/40 font-black print:border-black print:text-black">
                    <th className="pb-4">Email Cadastrado</th>
                    <th className="pb-4 text-right">Data de Inscrição</th>
                  </tr>
                </thead>
                <tbody className="text-xs">
                  {newsletter.map((sub) => (
                    <tr key={sub.id} className="border-b border-white/5 hover:bg-white/5 transition-colors group print:border-black/10">
                      <td className="py-4 font-bold text-soft-blue underline decoration-dotted print:text-black">
                        <a href={`mailto:${sub.email}`} title="Enviar e-mail">
                          {sub.email}
                        </a>
                      </td>
                      <td className="py-4 text-right text-white/40 group-hover:text-white transition-colors print:text-black">
                        {sub.createdAt?.toDate ? new Intl.DateTimeFormat('pt-BR', { dateStyle: 'short', timeStyle: 'short' }).format(sub.createdAt.toDate()) : '---'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
