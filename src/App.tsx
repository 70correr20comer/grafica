import React, { useState, useEffect, useRef } from 'react';
import { 
  Printer, 
  Layers, 
  Image as ImageIcon, 
  Send, 
  FileText, 
  CheckCircle, 
  Phone, 
  Mail, 
  Trash2, 
  MapPin, 
  Clock, 
  Sparkles, 
  UploadCloud, 
  AlertCircle, 
  Database, 
  Copy, 
  PlusCircle, 
  Search, 
  Menu, 
  X, 
  Check, 
  ChevronRight, 
  ShoppingBag,
  ExternalLink,
  MessageCircle
} from 'lucide-react';
import { 
  fetchOrders, 
  saveOrder, 
  deleteOrder, 
  updateOrderStatus, 
  getDatabaseStatus, 
  Order 
} from './supabase';

// Gallery Categories and Items
const CATEGORIES = ['Todos', 'Papelaria', 'Comunicação Visual', 'Brindes', 'Embalagens'];

const GALLERY_ITEMS = [
  {
    id: 'gal-1',
    title: 'Cartões de Visita Premium',
    category: 'Papelaria',
    description: 'Bordas arredondadas, verniz localizado e acabamento fosco Soft Touch.',
    imgUrl: 'https://images.unsplash.com/photo-1589330273594-fade1ee91647?auto=format&fit=crop&q=80&w=600',
    tags: ['Couché 300g', 'Verniz Localizado']
  },
  {
    id: 'gal-2',
    title: 'Panfletos de Alta Tiragem',
    category: 'Papelaria',
    description: 'Cores vibrantes em papel couché brilhoso para divulgação de alto impacto.',
    imgUrl: 'https://images.unsplash.com/photo-1561070791-26c113006238?auto=format&fit=crop&q=80&w=600',
    tags: ['Couché 90g', 'Cores Fiéis']
  },
  {
    id: 'gal-3',
    title: 'Banners Roll-Up de Alumínio',
    category: 'Comunicação Visual',
    description: 'Estrutura retrátil em alumínio, lona 440g fosca antirreflexo.',
    imgUrl: 'https://images.unsplash.com/photo-1594122230689-45899d9e6f69?auto=format&fit=crop&q=80&w=600',
    tags: ['Lona 440g', 'Portátil']
  },
  {
    id: 'gal-4',
    title: 'Adesivos Vinílicos Decorativos',
    category: 'Comunicação Visual',
    description: 'Recorte eletrônico de alta precisão, à prova d\'água para vitrines e carros.',
    imgUrl: 'https://images.unsplash.com/photo-1550684848-fac1c5b4e853?auto=format&fit=crop&q=80&w=600',
    tags: ['Meio Corte', 'Vinil Fosco']
  },
  {
    id: 'gal-5',
    title: 'Agendas & Cadernos Corporativos',
    category: 'Brindes',
    description: 'Capa dura personalizada com hot stamping dourado e miolo customizado.',
    imgUrl: 'https://images.unsplash.com/photo-1531346878377-a5be20888e57?auto=format&fit=crop&q=80&w=600',
    tags: ['Capa Dura', 'Hot Stamping']
  },
  {
    id: 'gal-6',
    title: 'Sacolas Ecológicas em Kraft',
    category: 'Embalagens',
    description: 'Impressão serigráfica em papel kraft resistente para lojas e marcas ecológicas.',
    imgUrl: 'https://images.unsplash.com/photo-1544816155-12df9643f363?auto=format&fit=crop&q=80&w=600',
    tags: ['Kraft 120g', 'Sustentável']
  },
  {
    id: 'gal-7',
    title: 'Canecas de Cerâmica Personalizadas',
    category: 'Brindes',
    description: 'Impressão por sublimação com brilho total e alta durabilidade em lava-louças.',
    imgUrl: 'https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?auto=format&fit=crop&q=80&w=600',
    tags: ['Sublimação', 'Cerâmica AAA']
  },
  {
    id: 'gal-8',
    title: 'Embalagens Cartonadas para Delivery',
    category: 'Embalagens',
    description: 'Papel cartão duplex com barreira de gordura sob medida para alimentos.',
    imgUrl: 'https://images.unsplash.com/photo-1512909006721-3d6018887383?auto=format&fit=crop&q=80&w=600',
    tags: ['Papel Cartão', 'Barreira de Gordura']
  }
];

// Product estimation values
const PRODUCT_OPTIONS = [
  { name: 'Cartão de Visita Premium', defaultQty: 500, minQty: 100, pricePerUnit: 0.15, description: 'Couché 300g, Verniz Localizado, Laminação Fosca' },
  { name: 'Panfletos A5 Corporativos', defaultQty: 1000, minQty: 250, pricePerUnit: 0.08, description: 'Couché 115g, Colorido Frente e Verso' },
  { name: 'Banners Roll-Up 80x200cm', defaultQty: 1, minQty: 1, pricePerUnit: 149.00, description: 'Lona 440g com suporte retrátil em alumínio' },
  { name: 'Adesivos Vinil Meio-Corte (5x5cm)', defaultQty: 500, minQty: 100, pricePerUnit: 0.25, description: 'Adesivo em Vinil à prova d\'água, recortado por unidade' },
  { name: 'Agendas Personalizadas Luxo', defaultQty: 50, minQty: 10, pricePerUnit: 35.00, description: 'Capa dura com wire-o, laminação fosca e elástico' },
  { name: 'Sacolas Kraft com Logo (Média)', defaultQty: 200, minQty: 50, pricePerUnit: 1.80, description: 'Papel Kraft Pardo 120g, alça torcida' }
];

export default function App() {
  // Mobile navigation state
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [activeSection, setActiveSection] = useState('home');

  // Database and Orders State
  const [orders, setOrders] = useState<Order[]>([]);
  const [loadingOrders, setLoadingOrders] = useState(true);
  const [errorOrders, setErrorOrders] = useState<string | null>(null);
  const [dbStatus, setDbStatus] = useState(getDatabaseStatus());
  const [copiedSql, setCopiedSql] = useState(false);

  // Filter for photo gallery
  const [galleryFilter, setGalleryFilter] = useState('Todos');

  // New Order Form State
  const [formData, setFormData] = useState({
    client_name: '',
    client_email: '',
    client_phone: '',
    product_type: PRODUCT_OPTIONS[0].name,
    quantity: PRODUCT_OPTIONS[0].defaultQty,
    details: '',
  });
  const [isSubmittingOrder, setIsSubmittingOrder] = useState(false);
  const [orderSuccess, setOrderSuccess] = useState<Order | null>(null);

  // File upload simulation state
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Email Contact Form State
  const [contactData, setContactData] = useState({
    name: '',
    email: '',
    subject: '',
    message: ''
  });
  const [emailSuccess, setEmailSuccess] = useState(false);
  const [emailError, setEmailError] = useState(false);

  // Admin section: view and update order status
  const [showAdminPanel, setShowAdminPanel] = useState(false);

  // Active anchor-link handler via Intersection Observer
  useEffect(() => {
    const sections = ['home', 'servicos', 'galeria', 'encomenda', 'contato'];
    const observers = sections.map(id => {
      const element = document.getElementById(id);
      if (!element) return null;

      const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            setActiveSection(id);
          }
        });
      }, { threshold: 0.3, rootMargin: '-10% 0px -40% 0px' });

      observer.observe(element);
      return { observer, element };
    });

    return () => {
      observers.forEach(obs => {
        if (obs) obs.observer.unobserve(obs.element);
      });
    };
  }, []);

  // Fetch orders from database (Supabase or localStorage)
  const loadOrdersData = async () => {
    setLoadingOrders(true);
    try {
      const fetched = await fetchOrders();
      setOrders(fetched);
      setErrorOrders(null);
    } catch (err: any) {
      console.error('Falha ao carregar encomendas:', err);
      setErrorOrders(err.message || 'Não foi possível obter a lista de encomendas do banco de dados.');
    } finally {
      setLoadingOrders(false);
    }
  };

  useEffect(() => {
    loadOrdersData();
    setDbStatus(getDatabaseStatus());
  }, []);

  // Order Quantity change syncing helper
  useEffect(() => {
    const selectedProd = PRODUCT_OPTIONS.find(p => p.name === formData.product_type);
    if (selectedProd) {
      // If quantity is lower than minimum quantity for selected product, correct it
      if (formData.quantity < selectedProd.minQty) {
        setFormData(prev => ({ ...prev, quantity: selectedProd.minQty }));
      }
    }
  }, [formData.product_type]);

  // Pricing engine calculator
  const calculateLivePrice = () => {
    const curProd = PRODUCT_OPTIONS.find(p => p.name === formData.product_type);
    if (!curProd) return 0;
    
    // Scale unit pricing slighty depending on quantity (volume discount)
    let dynamicPricePerUnit = curProd.pricePerUnit;
    if (formData.quantity >= curProd.defaultQty * 2) {
      dynamicPricePerUnit *= 0.85; // 15% discount for bulk
    } else if (formData.quantity >= curProd.defaultQty * 5) {
      dynamicPricePerUnit *= 0.75; // 25% discount for mammoth orders
    }

    const calculated = dynamicPricePerUnit * formData.quantity;
    // Set minimal administrative run fee (R$ 45) for custom setups, except on Banners/Agendas which can be individual
    if (curProd.minQty > 1 && calculated < 45) {
      return 45;
    }
    return parseFloat(calculated.toFixed(2));
  };

  // Drag and Drop File Handlers
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      setUploadedFile(e.dataTransfer.files[0]);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setUploadedFile(e.target.files[0]);
    }
  };

  // Submit Order Form Action
  const handleSubmitOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.client_name || !formData.client_email || !formData.client_phone) {
      alert('Favor preencher o Nome, E-mail e Celular corretamente.');
      return;
    }

    setIsSubmittingOrder(true);
    try {
      const designDetails = uploadedFile 
        ? `${formData.details} [Arquivo de arte anexado: ${uploadedFile.name} (${(uploadedFile.size / 1024).toFixed(1)}KB)]`
        : formData.details;

      const saved = await saveOrder({
        client_name: formData.client_name,
        client_email: formData.client_email,
        client_phone: formData.client_phone,
        product_type: formData.product_type,
        quantity: Number(formData.quantity),
        details: designDetails
      });

      setOrderSuccess(saved);
      // Reload database order lists
      loadOrdersData();
      
      // Clear specific aspects of form
      setFormData(prev => ({
        ...prev,
        details: '',
      }));
      setUploadedFile(null);
    } catch (err: any) {
      console.error('Falha ao registrar encomenda:', err);
      alert(`Falha ao registrar encomenda no banco de dados: ${err.message || err}`);
    } finally {
      setIsSubmittingOrder(false);
    }
  };

  // WhatsApp Integration URL generator
  const triggerWhatsAppQuery = (text: string) => {
    // Standard phone number format for Gráfica: fictitious, but real format
    const phone = '5511999999999'; 
    const url = `https://wa.me/${phone}?text=${encodeURIComponent(text)}`;
    window.open(url, '_blank', 'noopener,noreferrer');
  };

  const shareOrderToWhatsApp = (order: Order) => {
    const text = `Olá! Acabei de fazer uma encomenda no site da ArtImpressa!
    
📝 *Código da Encomenda:* ${order.id}
👤 *Cliente:* ${order.client_name}
📦 *Produto:* ${order.product_type}
🔢 *Quantidade:* ${order.quantity} un
💵 *Orçamento Estimado:* R$ ${order.price.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
💬 *Detalhes:* ${order.details || 'Sem especificações adicionais'}

Por favor, poderiam prosseguir com o meu pedido? Obrigado!`;
    triggerWhatsAppQuery(text);
  };

  const triggerGeneralWhatsApp = () => {
    const text = `Olá! Gostaria de fazer um orçamento personalizado ou tirar dúvidas sobre os prazos da ArtImpressa. Podem me ajudar?`;
    triggerWhatsAppQuery(text);
  };

  // Email Contact Submission
  const handleContactSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!contactData.name || !contactData.email || !contactData.message) {
      setEmailError(true);
      return;
    }

    // Simulate sending email success
    setEmailSuccess(true);
    setEmailError(false);
    setContactData({
      name: '',
      email: '',
      subject: '',
      message: ''
    });
    setTimeout(() => setEmailSuccess(false), 8000);
  };

  // Admin actions: Status Update & Delete
  const handleUpdateStatus = async (id: string, nextStatus: Order['status']) => {
    try {
      const success = await updateOrderStatus(id, nextStatus);
      if (success) {
        loadOrdersData();
      } else {
        alert('Não foi possível atualizar o status no banco de dados.');
      }
    } catch (err: any) {
      alert(`Erro ao atualizar status: ${err.message || err}`);
    }
  };

  const handleDeleteOrder = async (id: string) => {
    if (confirm('Deseja realmente remover esta encomenda do banco de dados?')) {
      try {
        const success = await deleteOrder(id);
        if (success) {
          loadOrdersData();
        } else {
          alert('Falha ao excluir do banco de dados.');
        }
      } catch (err: any) {
        alert(`Erro ao excluir: ${err.message || err}`);
      }
    }
  };

  // Filter gallery items
  const filteredGallery = galleryFilter === 'Todos'
    ? GALLERY_ITEMS
    : GALLERY_ITEMS.filter(item => item.category === galleryFilter);

  const copySQLCode = () => {
    if (dbStatus.tableInstructions) {
      navigator.clipboard.writeText(dbStatus.tableInstructions);
      setCopiedSql(true);
      setTimeout(() => setCopiedSql(false), 3000);
    }
  };

  // Calculate stats for admin dashboard
  const stats = {
    total: orders.length,
    pending: orders.filter(o => o.status === 'Pendente').length,
    production: orders.filter(o => o.status === 'Em Produção').length,
    completed: orders.filter(o => o.status === 'Concluido' || o.status === 'Entregue').length,
  };

  return (
    <div className="min-h-screen bg-[#070A13] text-[#E2E8F0] font-sans selection:bg-zinc-800 selection:text-white" id="home">
      
      {/* HEADER SECTION WITH ANCHORS - ULTRA PROFESSIONAL DARK */}
      <header className="sticky top-0 z-50 bg-[#070A13]/85 backdrop-blur-md border-b border-zinc-800 shadow-lg shadow-black/20 transition-all duration-300">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
          
          {/* Logo Brand */}
          <a href="#home" className="flex items-center gap-3 group">
            <div className="relative flex items-center justify-center w-11 h-11 rounded-xl bg-zinc-900 border border-zinc-800 overflow-hidden shadow-inner font-mono">
              {/* Minimalist monochromatic representing layers */}
              <span className="absolute top-1 left-1.5 w-3.5 h-3.5 rounded-full bg-zinc-650 opacity-90 animate-pulse"></span>
              <span className="absolute bottom-1 right-1.5 w-3.5 h-3.5 rounded-full bg-zinc-700 opacity-90"></span>
              <span className="absolute bottom-1 left-1.5 w-3.5 h-3.5 rounded-full bg-zinc-600 opacity-90"></span>
              <Printer className="w-5 h-5 text-white z-10 transition-transform duration-300 group-hover:rotate-12" />
            </div>
            <div>
              <span className="font-extrabold text-xl tracking-tight text-white block leading-none">
                ArtImpressa
              </span>
              <span className="text-[10px] uppercase tracking-widest text-zinc-450 font-bold">Gráfica Premium</span>
            </div>
          </a>

          {/* Nav Icons / Anchor Desktop links */}
          <nav className="hidden md:flex gap-1 bg-[#131B2E]/90 p-1 rounded-xl border border-zinc-805/80">
            {[
              { id: 'home', label: 'Início' },
              { id: 'servicos', label: 'Serviços' },
              { id: 'galeria', label: 'Galeria' },
              { id: 'encomenda', label: 'Encomendas' },
              { id: 'contato', label: 'Contato' }
            ].map(link => (
              <a
                key={link.id}
                href={`#${link.id}`}
                className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all duration-250 ${
                  activeSection === link.id
                    ? 'bg-zinc-800 text-white shadow-md font-semibold'
                    : 'text-zinc-400 hover:text-white hover:bg-zinc-800/30'
                }`}
                id={`anchor-nav-${link.id}`}
              >
                {link.label}
              </a>
            ))}
          </nav>

          {/* Action buttons */}
          <div className="hidden lg:flex items-center gap-3">
            <button 
              onClick={() => {
                const enc = document.getElementById('encomenda');
                if (enc) enc.scrollIntoView({ behavior: 'smooth' });
              }}
              className="lg:flex items-center gap-2 bg-white text-[#070A13] font-extrabold text-sm px-5 py-2.5 rounded-xl hover:bg-zinc-200 transition-all active:scale-95 duration-100"
              id="cta-make-order"
            >
              <ShoppingBag className="w-4 h-4 text-[#070A13]" />
              Solicitar Encomenda
            </button>
            
            <button 
              onClick={triggerGeneralWhatsApp}
              className="flex items-center gap-2 bg-zinc-800 hover:bg-zinc-750 text-white font-semibold text-sm px-4 py-2.5 rounded-xl transition-all duration-150 active:scale-95 shadow-sm border border-zinc-700"
              id="header-whatsapp-btn"
            >
              <Phone className="w-4 h-4 fill-white text-white" />
              WhatsApp
            </button>
          </div>

          {/* Mobile hamburger menu trigger */}
          <div className="md:hidden flex items-center gap-2">
            <button 
              onClick={triggerGeneralWhatsApp}
              className="p-2 sm:px-3 bg-zinc-800 hover:bg-zinc-750 text-white rounded-lg transition-all duration-150 border border-zinc-700"
              title="Chamar no WhatsApp"
              id="mobile-whatsapp-call"
            >
              <Phone className="w-4 h-4 fill-white text-white" />
            </button>
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2.5 rounded-xl bg-zinc-900 hover:bg-zinc-800 text-white border border-zinc-800"
              id="hamburger-menu"
              aria-label="Abrir menu"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>

        </div>

        {/* Mobile Navigation Dropdown */}
        {mobileMenuOpen && (
          <div className="md:hidden border-t border-zinc-800 bg-[#070A13] py-4 px-4 shadow-lg animate-fadeIn">
            <div className="flex flex-col gap-2">
              {[
                { id: 'home', label: 'Início' },
                { id: 'servicos', label: 'Serviços & Produtos' },
                { id: 'galeria', label: 'Galeria de Fotos' },
                { id: 'encomenda', label: 'Fazer Encomenda' },
                { id: 'contato', label: 'Contato por E-mail' }
              ].map(link => (
                <a
                  key={link.id}
                  href={`#${link.id}`}
                  onClick={() => setMobileMenuOpen(false)}
                  className={`px-4 py-3 rounded-xl text-base font-semibold ${
                    activeSection === link.id
                      ? 'bg-zinc-800 text-white'
                      : 'text-zinc-400 hover:bg-zinc-900/50 hover:text-white'
                  }`}
                  id={`mobile-nav-${link.id}`}
                >
                  {link.label}
                </a>
              ))}
              <div className="pt-4 border-t border-zinc-800 flex flex-col gap-2">
                <button
                  onClick={() => {
                    setMobileMenuOpen(false);
                    const target = document.getElementById('encomenda');
                    if (target) target.scrollIntoView({ behavior: 'smooth' });
                  }}
                  className="w-full py-3 bg-white text-zinc-950 font-extrabold rounded-xl text-center"
                  id="mobile-order-btn"
                >
                  Orçamento de Gráfica Rápida
                </button>
              </div>
            </div>
          </div>
        )}
      </header>

      {/* HERO SECTION DEEP GLOSS DARK */}
      <section className="relative overflow-hidden pt-12 pb-20 md:py-32 bg-gradient-to-b from-[#070A13] via-[#0E1528] to-[#070A13]">
        
        {/* CMYK Soft Background Orbs - now subtle muted grey/slate */}
        <div className="absolute right-[-10%] top-[10%] w-[35rem] h-[35rem] rounded-full bg-zinc-800/5 blur-3xl pointer-events-none -z-10"></div>
        <div className="absolute left-[-5%] bottom-[5%] w-[30rem] h-[30rem] rounded-full bg-zinc-800/5 blur-3xl pointer-events-none -z-10"></div>
        <div className="absolute left-[30%] top-[40%] w-[25rem] h-[25rem] rounded-full bg-zinc-900/5 blur-3xl pointer-events-none -z-10"></div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            
            {/* Left intro details */}
            <div className="lg:col-span-7 text-center lg:text-left space-y-6">
              
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-slate-950 border border-zinc-800 text-zinc-300 text-xs font-bold uppercase tracking-wider">
                <Sparkles className="w-3.5 h-3.5 text-zinc-400" />
                Matriz de Impressão Ultra-HD Ativa
              </div>

              <h1 className="text-4xl sm:text-5xl md:text-6xl font-black text-white tracking-tight leading-tight" id="hero-main-title">
                Sua marca impressa com <span className="relative inline-block text-transparent bg-clip-text bg-gradient-to-r from-white via-zinc-300 to-zinc-500">precisão cirúrgica</span> e brilho incomparável.
              </h1>

              <p className="text-base sm:text-lg md:text-xl text-slate-350 max-w-2xl mx-auto lg:mx-0 leading-relaxed">
                Da papelaria corporativa de luxo aos grandes formatos de comunicação visual. Impressão profissional de cartões com verniz localizado, folhetos em massa, banners vibrantes e brindes gravados a laser, tudo integrado diretamente ao banco de dados e sincronizado ao WhatsApp.
              </p>

              <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4">
                <button
                  onClick={() => {
                    const target = document.getElementById('encomenda');
                    if (target) target.scrollIntoView({ behavior: 'smooth' });
                  }}
                  className="w-full sm:w-auto px-8 py-4 bg-white text-zinc-950 hover:bg-zinc-200 rounded-2xl font-black tracking-wide shadow-lg shadow-zinc-550/10 active:scale-95 transition-all duration-200 flex items-center justify-center gap-2 group"
                  id="cta-cta-order-now"
                >
                  <ShoppingBag className="w-5 h-5 text-zinc-950 group-hover:scale-110 transition-transform" />
                  Iniciar Pedido Online
                </button>

                <button
                  onClick={() => {
                    const target = document.getElementById('galeria');
                    if (target) target.scrollIntoView({ behavior: 'smooth' });
                  }}
                  className="w-full sm:w-auto px-8 py-4 bg-slate-900 hover:bg-slate-850 text-slate-100 rounded-2xl font-bold tracking-wide border border-zinc-800 transition-all duration-150 flex items-center justify-center gap-2"
                  id="cta-view-portfolio"
                >
                  <ImageIcon className="w-5 h-5 text-zinc-400" />
                  Ver Portfólio
                </button>
              </div>

              {/* Trust markers */}
              <div className="pt-6 grid grid-cols-3 gap-6 max-w-md mx-auto lg:mx-0 border-t border-zinc-800">
                <div>
                  <span className="block text-2xl font-extrabold text-white">2h rádio</span>
                  <span className="text-xs text-zinc-400 font-bold">Entrega Expressa</span>
                </div>
                <div>
                  <span className="block text-2xl font-extrabold text-white">100%</span>
                  <span className="text-xs text-zinc-400 font-bold">Fidelidade de Cores</span>
                </div>
                <div>
                  <span className="block text-2xl font-extrabold text-white">+15k</span>
                  <span className="text-xs text-zinc-400 font-bold">Clientes Atendidos</span>
                </div>
              </div>

            </div>

            {/* Right: Awesome Interactive Graphic Print Stack Visualizer */}
            <div className="lg:col-span-5 relative">
              <div className="relative mx-auto max-w-sm sm:max-w-md aspect-square rounded-3xl p-6 bg-gradient-to-tr from-slate-950 via-[#101726] to-slate-900 border border-zinc-800 shadow-2xl text-white overflow-hidden">
                
                {/* Visual CMYK rollers - now sleek monochrome representing gray shades */}
                <div className="absolute top-3 right-3 flex gap-1.5 opacity-80 backdrop-blur-md bg-white/5 py-1 px-2 rounded-full border border-white/10 text-[10px] tracking-wider font-mono font-bold">
                  <span className="text-zinc-300">K1</span>
                  <span className="text-zinc-400">K2</span>
                  <span className="text-zinc-500">K3</span>
                  <span className="text-zinc-200">K4</span>
                </div>

                <div className="h-full flex flex-col justify-between relative z-10">
                  <div className="space-y-2">
                    <div className="flex items-center gap-2 text-xs text-zinc-400 uppercase font-black tracking-widest">
                      <Layers className="w-4 h-4 text-zinc-400" />
                      Linha de Impressão Ativa
                    </div>
                    <h3 className="text-xl sm:text-2xl font-black tracking-tight leading-snug">
                      Heidelberg Speedmaster Heidelberg S-Line XL.
                    </h3>
                  </div>

                  {/* Graphic designer representation */}
                  <div className="my-4 py-3 px-4 rounded-xl bg-slate-900/50 border border-zinc-800 space-y-2 text-xs">
                    <div className="flex justify-between items-center text-[#94A3B8] font-bold">
                      <span>Mockup Ativo</span>
                      <span className="text-white">Fidúcia Ativa</span>
                    </div>
                    <div className="h-[3px] bg-slate-950 rounded-full overflow-hidden">
                      <div className="h-full bg-white w-[78%] animate-pulse"></div>
                    </div>
                    <div className="flex justify-between items-center text-[10px] text-zinc-400">
                      <span>Progresso da Offset: 78%</span>
                      <span>DPI: 2400 × 2400</span>
                    </div>
                  </div>

                  {/* Highlight card stack */}
                  <div className="space-y-2">
                    <div className="text-xs font-bold text-zinc-450">Produtos populares esta semana:</div>
                    <div className="grid grid-cols-2 gap-2 text-xs">
                      <div className="bg-[#131B2E] p-2.5 rounded-lg border border-zinc-800/80 flex items-center gap-1.5 hover:bg-zinc-800/50 hover:border-zinc-500/50 transition-all">
                        <CheckCircle className="w-3.5 h-3.5 text-white flex-shrink-0" />
                        <span>Couché 300g</span>
                      </div>
                      <div className="bg-[#131B2E] p-2.5 rounded-lg border border-zinc-800/80 flex items-center gap-1.5 hover:bg-zinc-800/50 hover:border-zinc-500/50 transition-all">
                        <CheckCircle className="w-3.5 h-3.5 text-white flex-shrink-0" />
                        <span>Adesivos Recortados</span>
                      </div>
                      <div className="bg-[#131B2E] p-2.5 rounded-lg border border-zinc-800/80 flex items-center gap-1.5 hover:bg-zinc-800/50 hover:border-zinc-500/50 transition-all">
                        <CheckCircle className="w-3.5 h-3.5 text-white flex-shrink-0" />
                        <span>Brindes Gravados</span>
                      </div>
                      <div className="bg-[#131B2E] p-2.5 rounded-lg border border-zinc-800/80 flex items-center gap-1.5 hover:bg-zinc-800/50 hover:border-zinc-500/50 transition-all">
                        <CheckCircle className="w-3.5 h-3.5 text-white flex-shrink-0" />
                        <span>Banner de Lona</span>
                      </div>
                    </div>
                  </div>

                </div>

                {/* Subtile artistic circles over dark backdrop */}
                <span className="absolute bottom-[-10%] right-[-10%] w-48 h-48 rounded-full bg-zinc-800/10 blur-2xl"></span>
                <span className="absolute top-[-5%] left-[-5%] w-32 h-32 rounded-full bg-zinc-900/10 blur-2xl"></span>

              </div>
            </div>

          </div>
        </div>
      </section>

      {/* PRODUTOS E SERVIÇOS SECTION */}
      <section className="py-20 md:py-28 bg-[#090D16] border-y border-zinc-800" id="servicos">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          
          <div className="text-center max-w-3xl mx-auto space-y-4 mb-16">
            <h2 className="text-xs uppercase font-extrabold tracking-widest text-zinc-400">Catálogo de Impressão</h2>
            <p className="text-3xl sm:text-4xl font-black text-white tracking-tight">
              Nossos Produtos Favoritos e Serviços sob Medida
            </p>
            <p className="text-slate-300 text-base leading-relaxed">
              Equipamento offset de última geração e plotter digital de alta definição garantem acabamento profissional impecável sob qualquer formato ou tiragem.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {PRODUCT_OPTIONS.map((prod, index) => {
              // Map gradients for service item visual styling - now fully premium gray/dark theme
              const borderStyles = [
                'hover:border-zinc-650 hover:shadow-white/5',
                'hover:border-zinc-700 hover:shadow-white/5',
                'hover:border-zinc-600 hover:shadow-white/5',
                'hover:border-zinc-750 hover:shadow-white/5',
                'hover:border-zinc-650 hover:shadow-white/5',
                'hover:border-zinc-700 hover:shadow-white/5'
              ];
              const bulletIcons = [
                'bg-zinc-800 text-white border border-zinc-700',
                'bg-zinc-750 text-white border border-zinc-650',
                'bg-zinc-900 text-zinc-300 border border-zinc-800',
                'bg-zinc-850 text-white border border-zinc-750',
                'bg-zinc-800 text-white border border-zinc-700',
                'bg-zinc-750 text-zinc-300 border border-zinc-650'
              ];

              return (
                <div 
                  key={index}
                  className={`bg-[#131B2E] rounded-2xl p-6 border border-zinc-800/85 hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1 relative group flex flex-col justify-between ${borderStyles[index % borderStyles.length]}`}
                  id={`service-card-${index}`}
                >
                  <div>
                    <div className="flex items-center justify-between mb-4">
                      <span className={`w-10 h-10 rounded-xl flex items-center justify-center font-extrabold text-sm ${bulletIcons[index % bulletIcons.length]}`}>
                        0{index + 1}
                      </span>
                      <span className="text-xs bg-slate-900 border border-zinc-800 font-bold text-zinc-300 py-1 px-2.5 rounded-full">
                        Min: {prod.minQty} un
                      </span>
                    </div>

                    <h3 className="text-xl font-bold text-white mb-2 group-hover:text-zinc-300 transition-colors">
                      {prod.name}
                    </h3>
                    
                    <p className="text-slate-350 text-sm mb-6 leading-relaxed">
                      {prod.description}
                    </p>
                  </div>

                  <div className="border-t border-zinc-800/80 pt-4 mt-auto flex items-center justify-between">
                    <div>
                      <span className="text-[10px] uppercase font-bold text-zinc-400 block tracking-wider">A partir de</span>
                      <span className="text-base font-black text-white">
                        R$ {prod.pricePerUnit >= 10 
                          ? `${prod.pricePerUnit.toFixed(2)}` 
                          : `${(prod.pricePerUnit).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}/un`
                        }
                      </span>
                    </div>
                    <button
                      onClick={() => {
                        setFormData(prev => ({
                          ...prev,
                          product_type: prod.name,
                          quantity: prod.defaultQty
                        }));
                        const target = document.getElementById('encomenda');
                        if (target) target.scrollIntoView({ behavior: 'smooth' });
                      }}
                      className="inline-flex items-center gap-1.5 text-xs font-bold text-zinc-355 group-hover:text-white hover:underline"
                      id={`buy-service-btn-${index}`}
                    >
                      Solicitar Orçamento
                      <ChevronRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>

          <div className="mt-12 text-center">
            <div className="inline-flex flex-col sm:flex-row items-center gap-4 bg-slate-950 border border-slate-850 text-white p-4 sm:py-3 sm:px-6 rounded-2xl shadow-lg">
              <span className="text-sm font-bold text-slate-300">Não achou o material ou o formato que precisa?</span>
              <button
                onClick={triggerGeneralWhatsApp}
                className="bg-[#25D366] hover:bg-[#20ba5a] text-white px-5 py-2' rounded-xl text-xs font-extrabold tracking-wide uppercase transition-all duration-150 flex items-center gap-1.5"
                id="cta-special-orçamento"
              >
                Orçamento Personalizado via WhatsApp
                <ExternalLink className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

        </div>
      </section>

      {/* GALERIA DE FOTOS SECTION */}
      <section className="py-20 md:py-28 bg-[#070A13]" id="galeria">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          
          <div className="flex flex-col md:flex-row md:items-end md:justify-between mb-12 gap-6">
            <div className="max-w-xl space-y-3 text-left">
              <h2 className="text-xs uppercase font-extrabold tracking-widest text-zinc-400">Mostruário de Qualidade</h2>
              <h3 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
                Galeria de Trabalhos Prontos
              </h3>
              <p className="text-slate-300 text-sm">
                Confira algumas fotos de encomendas reais de nossos clientes. Sinta a textura, nitidez de cores e precisão de corte nos nossos produtos prontos.
              </p>
            </div>

            {/* Filter buttons */}
            <div className="flex flex-wrap gap-2">
              {CATEGORIES.map(cat => (
                <button
                  key={cat}
                  onClick={() => setGalleryFilter(cat)}
                  className={`px-4 py-2 rounded-xl text-xs font-bold transition-all duration-155 tracking-wide ${
                    galleryFilter === cat
                      ? 'bg-white border border-white text-zinc-950 font-black shadow-lg shadow-zinc-550/10'
                      : 'bg-[#131B2E] hover:bg-zinc-800 border border-zinc-800 text-slate-300'
                  }`}
                  id={`filter-btn-${cat.replace(' ', '-').toLowerCase()}`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>

          {/* Grid Layout Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {filteredGallery.map((item, idx) => (
              <div 
                key={item.id} 
                className="group rounded-2xl border border-zinc-800/80 overflow-hidden bg-[#131B2E] hover:shadow-2xl hover:border-zinc-700 transition-all duration-300"
                id={`gallery-item-${item.id}`}
              >
                {/* Image Container */}
                <div className="relative aspect-[4/3] overflow-hidden bg-slate-900 border-b border-zinc-800">
                  <img 
                    src={item.imgUrl} 
                    alt={item.title}
                    className="object-cover w-full h-full transition-transform duration-500 group-hover:scale-105"
                    loading="lazy"
                  />
                  <span className="absolute top-3 left-3 bg-slate-950/90 backdrop-blur-sm text-white text-[10px] font-extrabold px-2.5 py-1 rounded-full uppercase tracking-wider border border-white/5">
                    {item.category}
                  </span>
                </div>

                {/* Info Container */}
                <div className="p-5 space-y-2">
                  <h4 className="text-base font-extrabold text-white group-hover:text-zinc-300 transition-colors">{item.title}</h4>
                  <p className="text-slate-350 text-xs leading-relaxed">{item.description}</p>
                  
                  {/* Tags */}
                  <div className="pt-2 flex flex-wrap gap-1">
                    {item.tags.map((tag, tIdx) => (
                      <span 
                        key={tIdx} 
                        className="text-[9px] font-bold text-slate-300 bg-zinc-900 border border-zinc-800 px-2 py-0.5 rounded"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Bottom callout */}
          <div className="mt-12 bg-[#131B2E]/60 rounded-2xl border border-zinc-800 p-6 flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="flex items-center gap-3">
              <span className="w-10 h-10 rounded-full bg-slate-900 border border-zinc-800 flex items-center justify-center text-zinc-300 flex-shrink-0">
                <Printer className="w-5 h-5 image-render-auto" />
              </span>
              <div>
                <span className="font-bold text-white block text-sm">Gostaria de ver amostras físicas?</span>
                <span className="text-xs text-slate-450">Visite nossa matriz para conhecer nosso catálogo completo de papéis e gramaturas sem compromisso.</span>
              </div>
            </div>
            <a 
              href="#contato"
              className="bg-zinc-800 hover:bg-zinc-700 border border-zinc-700 text-slate-100 font-extrabold text-xs px-5 py-3 rounded-xl transition-all shadow-sm"
              id="cta-visit-address"
            >
              Ver Endereço e Horários
            </a>
          </div>

        </div>
      </section>

      {/* ENCOMENDA FORM & DATABASE SECTION */}
      <section className="py-20 md:py-28 bg-[#070A13] border-t border-zinc-805" id="encomenda">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          
          <div className="text-center max-w-3xl mx-auto space-y-4 mb-14">
            <div className="inline-flex items-center gap-1 bg-slate-950 border border-zinc-800 rounded-full py-1 px-3 text-xs text-slate-250 font-bold">
              <Database className="w-3.5 h-3.5 text-zinc-400" />
              Sincronização Ativa com Banco de Dados
            </div>
            <h2 className="text-3xl sm:text-4xl font-black text-white tracking-tight">
              Faça sua Encomenda Online
            </h2>
            <p className="text-slate-350 text-sm">
              Preencha o formulário para registrar sua encomenda em nosso banco de dados. Você poderá acompanhar o andamento em tempo real no painel do cliente logo abaixo!
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            
            {/* Form Section */}
            <div className="lg:col-span-7 bg-[#131B2E] rounded-2xl border border-zinc-800/85 p-6 sm:p-8 shadow-2xl">
              <form onSubmit={handleSubmitOrder} className="space-y-6">
                
                <h3 className="text-lg font-black text-white border-b border-zinc-800 pb-3 flex items-center gap-2">
                  <div className="w-2.5 h-2.5 rounded-full bg-zinc-400"></div>
                  1. Detalhes de Contato
                </h3>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* Name field */}
                  <div className="space-y-1.5">
                    <label className="text-xs font-extrabold text-[#94A3B8] block" htmlFor="client_name">
                      Seu Nome Completo *
                    </label>
                    <input 
                      type="text"
                      id="client_name"
                      name="client_name"
                      required
                      value={formData.client_name}
                      onChange={(e) => setFormData(p => ({ ...p, client_name: e.target.value }))}
                      placeholder="Ex: Amanda Silva"
                      className="w-full rounded-xl border border-zinc-800 bg-[#070A13] text-white font-medium text-sm px-4 py-3 focus:outline-none focus:ring-2 focus:ring-zinc-500/30 focus:border-zinc-500"
                    />
                  </div>

                  {/* Phone field with whatsapp indicator */}
                  <div className="space-y-1.5">
                    <label className="text-xs font-extrabold text-[#94A3B8] block" htmlFor="client_phone">
                      WhatsApp/Celular *
                    </label>
                    <input 
                      type="tel"
                      id="client_phone"
                      name="client_phone"
                      required
                      value={formData.client_phone}
                      onChange={(e) => setFormData(p => ({ ...p, client_phone: e.target.value }))}
                      placeholder="Ex: 11999998888"
                      className="w-full rounded-xl border border-zinc-800 bg-[#070A13] text-white font-medium text-sm px-4 py-3 focus:outline-none focus:ring-2 focus:ring-zinc-500/30 focus:border-zinc-500"
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-extrabold text-[#94A3B8] block" htmlFor="client_email">
                    E-mail do Cliente *
                  </label>
                  <input 
                    type="email"
                    id="client_email"
                    name="client_email"
                    required
                    value={formData.client_email}
                    onChange={(e) => setFormData(p => ({ ...p, client_email: e.target.value }))}
                    placeholder="Ex: amanda@empresa.com.br"
                    className="w-full rounded-xl border border-zinc-800 bg-[#070A13] text-white font-medium text-sm px-4 py-3 focus:outline-none focus:ring-2 focus:ring-zinc-500/30 focus:border-zinc-500"
                  />
                </div>

                <h3 className="text-lg font-black text-white border-b border-zinc-800 pb-3 pt-4 flex items-center gap-2">
                  <div className="w-2.5 h-2.5 rounded-full bg-zinc-550"></div>
                  2. Configurações da Impressão
                </h3>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* Product Type select */}
                  <div className="space-y-1.5">
                    <label className="text-xs font-extrabold text-[#94A3B8] block" htmlFor="product_type">
                      Tipo de Produto Impresso
                    </label>
                    <select
                      id="product_type"
                      name="product_type"
                      value={formData.product_type}
                      onChange={(e) => {
                        const selectedVal = e.target.value;
                        const matchingProd = PRODUCT_OPTIONS.find(p => p.name === selectedVal);
                        setFormData(p => ({ 
                          ...p, 
                          product_type: selectedVal,
                          quantity: matchingProd ? matchingProd.defaultQty : 100
                        }));
                      }}
                      className="w-full rounded-xl border border-zinc-805 bg-[#070A13] text-white font-bold text-sm px-3.5 py-3 focus:outline-none focus:ring-2 focus:ring-zinc-500/30 focus:border-zinc-550"
                    >
                      {PRODUCT_OPTIONS.map((prod, idx) => (
                        <option key={idx} value={prod.name} className="bg-[#131B2E]">
                          {prod.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Quantity input with stepper dynamics */}
                  <div className="space-y-1.5">
                    <label className="text-xs font-extrabold text-[#94A3B8] block flex justify-between pr-1" htmlFor="quantity">
                      <span>Quantidade</span>
                      <span className="text-[10px] text-zinc-400 font-normal">
                        Mínimo: {PRODUCT_OPTIONS.find(p => p.name === formData.product_type)?.minQty} un
                      </span>
                    </label>
                    <input 
                      type="number"
                      id="quantity"
                      name="quantity"
                      required
                      min={PRODUCT_OPTIONS.find(p => p.name === formData.product_type)?.minQty || 1}
                      value={formData.quantity}
                      onChange={(e) => setFormData(p => ({ ...p, quantity: Math.max(1, Number(e.target.value)) }))}
                      className="w-full rounded-xl border border-zinc-800 bg-[#070A13] text-white font-bold text-sm px-4 py-3 focus:outline-none focus:ring-2 focus:ring-zinc-405/30 focus:border-zinc-500"
                    />
                  </div>
                </div>

                {/* Elegant drag and drop file upload */}
                <div className="space-y-1.5">
                  <label className="text-xs font-extrabold text-[#94A3B8] block">
                    Enviar Arte / Logotipo (Opcional)
                  </label>
                  <div
                    onDragOver={handleDragOver}
                    onDragLeave={handleDragLeave}
                    onDrop={handleDrop}
                    onClick={() => fileInputRef.current?.click()}
                    className={`border-2 border-dashed rounded-2xl p-6 text-center cursor-pointer transition-all ${
                      isDragging 
                        ? 'border-zinc-500 bg-zinc-550/5' 
                        : uploadedFile 
                          ? 'border-emerald-505 bg-emerald-950/5' 
                          : 'border-zinc-800 bg-[#070A13] hover:border-zinc-700 hover:bg-zinc-900/40'
                    }`}
                  >
                    <input 
                      type="file"
                      ref={fileInputRef}
                      className="hidden"
                      onChange={handleFileChange}
                      accept=".pdf,.png,.jpeg,.jpg,.ai,.cdr,.psd"
                    />
                    
                    <div className="flex flex-col items-center gap-2">
                       <UploadCloud className={`w-8 h-8 ${uploadedFile ? 'text-zinc-300 animate-pulse' : 'text-zinc-500'}`} />
                      {uploadedFile ? (
                        <div className="space-y-1 text-sm">
                          <p className="font-extrabold text-white">Arte integrada com sucesso!</p>
                          <p className="text-xs text-slate-300 font-mono inline-block bg-slate-900 border border-zinc-800 px-2 py-0.5 rounded">
                            {uploadedFile.name} ({(uploadedFile.size / 1024).toFixed(1)} KB)
                          </p>
                          <p className="text-[10px] text-zinc-400 block underline hover:text-red-400 pt-1" onClick={(e) => {
                            e.stopPropagation();
                            setUploadedFile(null);
                          }}>
                            Remover arquivo
                          </p>
                        </div>
                      ) : (
                        <div className="space-y-1">
                          <p className="font-extrabold text-xs text-slate-300">Arraste a sua arte aqui ou clique para selecionar</p>
                          <p className="text-[10px] text-zinc-500">Formatos aceitos: PDF, PNG, AI, CDR, PSD, JPG (Máx 25MB)</p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Details instruction box */}
                <div className="space-y-1.5">
                  <label className="text-xs font-extrabold text-[#94A3B8] block" htmlFor="details">
                    Especificações & Detalhes Adicionais
                  </label>
                  <textarea 
                    id="details"
                    name="details"
                    rows={3}
                    placeholder="Ex: Prefiro acabamento brilhoso. Desejo o fundo na cor preta e sem margem de corte."
                    value={formData.details}
                    onChange={(e) => setFormData(p => ({ ...p, details: e.target.value }))}
                    className="w-full rounded-xl border border-zinc-800 bg-[#070A13] text-white font-medium text-sm px-4 py-3 focus:outline-none focus:ring-2 focus:ring-zinc-500/20 focus:border-zinc-500"
                  />
                </div>

                {/* Form CTA */}
                <button
                  type="submit"
                  disabled={isSubmittingOrder}
                  className="w-full py-4 bg-white text-zinc-950 hover:bg-zinc-200 rounded-2xl font-black tracking-wide hover:shadow-xl transition-all active:scale-95 text-center flex items-center justify-center gap-2"
                  id="submit-order-form-btn"
                >
                  {isSubmittingOrder ? (
                    <span>Processando e gravando...</span>
                  ) : (
                    <>
                      <PlusCircle className="w-5 h-5 text-zinc-950" />
                      Confirmar e Gravar no Banco de Dados
                    </>
                  )}
                </button>

              </form>
            </div>

            {/* Calculations & Instructions Side Column */}
            <div className="lg:col-span-5 space-y-6">
              
              {/* Box A: Budget Calculator */}
              <div className="bg-slate-950 border border-zinc-850 rounded-2xl p-6 shadow-xl relative overflow-hidden">
                <span className="absolute top-[-2%] right-[-2%] w-24 h-24 rounded-full bg-zinc-805/5 blur-xl pointer-events-none"></span>

                <h3 className="text-sm uppercase font-bold text-slate-450 tracking-wider mb-4 flex items-center gap-2">
                  <Printer className="w-3.5 h-3.5 text-zinc-400 animate-pulse" />
                  Orçamento Estimado Live
                </h3>

                <div className="space-y-4">
                  <div className="flex justify-between items-start text-xs border-b border-zinc-850 pb-3">
                    <div className="text-slate-400 space-y-0.5">
                      <span className="font-bold block text-slate-200">{formData.product_type}</span>
                      <span>{formData.quantity} unidades selecionadas</span>
                    </div>
                    <span className="font-extrabold text-slate-350 font-mono">
                      R$ {PRODUCT_OPTIONS.find(p => p.name === formData.product_type)?.pricePerUnit.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}/un
                    </span>
                  </div>

                  {uploadedFile && (
                    <div className="flex justify-between items-center text-xs py-1 text-slate-300">
                      <span>Arquivo Anexo</span>
                      <span className="text-xs text-zinc-300 font-bold flex items-center gap-1">
                        <Check className="w-3 h-3 text-emerald-400" />
                        Grátis análise técnica
                      </span>
                    </div>
                  )}

                  <div className="pb-4 pt-1 flex justify-between items-baseline">
                    <span className="text-sm font-bold text-slate-400">Total Previsto:</span>
                    <div className="text-right">
                      <span className="text-3xl sm:text-4xl font-extrabold text-white">
                        R$ {calculateLivePrice().toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                      </span>
                      <span className="block text-[10px] text-slate-500 mt-1">Acabamento industrial incluso</span>
                    </div>
                  </div>

                  <div className="bg-[#131B2E] border border-zinc-800 rounded-xl p-3.5 text-[11px] text-slate-300 leading-relaxed space-y-1.5">
                    <span className="font-extrabold text-white block">⚡ Diferenciais da ArtImpressa:</span>
                    <p>• Impressão na mesma tarde se enviado até as 12:00h.</p>
                    <p>• Prova digital gratuita por e-mail antes da tiragem oficial.</p>
                  </div>
                </div>

              </div>

              {/* Box B: Dynamic Success WhatsApp Trigger */}
              {orderSuccess ? (
                <div className="bg-emerald-950/20 border border-emerald-800/80 rounded-2xl p-6 space-y-4 animate-scaleUp">
                  <div className="flex items-start gap-3">
                    <span className="p-1 px-1.5 rounded-full bg-emerald-900/50 text-emerald-400 border border-emerald-800/30">
                      <CheckCircle className="w-5 h-5 fill-emerald-900 text-emerald-400" />
                    </span>
                    <div className="space-y-1">
                      <span className="text-sm font-extrabold text-emerald-300 block leading-tight">Gravação Concluída!</span>
                      <span className="text-xs text-emerald-400 block leading-tight">Sua encomenda foi salva e listada com sucesso.</span>
                    </div>
                  </div>

                  <div className="bg-[#070A13] border border-emerald-850 rounded-xl p-4 text-xs text-slate-300 space-y-2">
                    <div className="flex justify-between">
                      <span className="font-bold text-slate-400">ID da Encomenda:</span>
                      <span className="font-mono font-extrabold text-zinc-300">{orderSuccess.id}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="font-bold text-slate-400">Valor Estimado:</span>
                      <span className="font-extrabold text-white">R$ {orderSuccess.price.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span>
                    </div>
                    <p className="text-[11px] text-slate-400 block bg-[#131B2E] p-2 rounded border border-slate-800">
                      "Para agilizar e garantir sua prioridade da esteira de impressão, clique abaixo para transmitir esta ordem agora mesmo ao nosso WhatsApp direto de atendimento."
                    </p>
                  </div>

                  <button
                    onClick={() => shareOrderToWhatsApp(orderSuccess)}
                    className="w-full py-3.5 bg-[#25D366] hover:bg-[#20ba5a] text-white rounded-xl font-bold text-xs tracking-wider uppercase transition-all duration-150 flex items-center justify-center gap-2 shadow-sm"
                    id="whatsapp-share-after-order"
                  >
                    <MessageCircle className="w-4 h-4 fill-white" />
                    Enviar Ordem para o WhatsApp
                  </button>
                </div>
              ) : (
                <div className="bg-[#131B2E] border border-zinc-805 rounded-2xl p-6 text-xs text-[#E2E8F0] space-y-3">
                  <div className="flex items-center gap-2">
                    <AlertCircle className="w-5 h-5 text-zinc-400 flex-shrink-0" />
                    <span className="font-extrabold text-white text-sm">Integração do Atendimento Direct</span>
                  </div>
                  <p className="text-slate-355 leading-relaxed">
                    Nossa central de impressão está 100% articulada com o WhatsApp. Após confirmar a encomenda no banco de dados acima, você poderá enviar as especificações geradas em uma única mensagem para o nosso operador.
                  </p>
                  <button 
                    onClick={triggerGeneralWhatsApp}
                    className="inline-flex items-center gap-1 font-bold text-zinc-300 hover:text-white hover:underline"
                    id="whatsapp-trigger-learn-more"
                  >
                    Dúvidas sobre envio de artes? Converse conosco agora
                    <ExternalLink className="w-3.5 h-3.5" />
                  </button>
                </div>
              )}

              {/* Box C: Real Database Configuration details (Supabase status) */}
              <div className="bg-slate-900/50 rounded-2xl border border-zinc-800 p-5 space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-extrabold text-slate-400 uppercase tracking-wider block">Status do Banco</span>
                  <span className={`text-[10px] uppercase font-bold py-0.5 px-2.5 rounded-full inline-block ${
                    dbStatus.isCloud ? 'bg-zinc-900 text-zinc-300 border border-zinc-800/80' : 'bg-zinc-850 text-zinc-400 text-center border border-zinc-800'
                  }`}>
                    {dbStatus.isCloud ? 'Supabase Ativo' : 'Armazenamento Mock Local'}
                  </span>
                </div>

                <div className="text-xs text-slate-404 gap-1.5 flex flex-col pt-1">
                  <p className="font-medium text-slate-300">{dbStatus.message}</p>
                  
                  {dbStatus.tableInstructions && (
                    <div className="mt-2 space-y-2">
                      <p className="text-[10px] leading-relaxed text-[#94A3B8]">
                        {dbStatus.isCloud 
                          ? 'Execute este script SQL completo no SQL Editor do seu painel Supabase para certificar-se de que a tabela e permissões (RLS) estão criadas corretamente:'
                          : 'Para converter esse site em uma plataforma completamente integrada à nuvem, adicione os segredos do Supabase ao painel lateral do AI Studio. Abaixo está o SQL para criar as tabelas:'}
                      </p>
                      
                      <div className="relative">
                        <pre className="bg-slate-950 text-slate-300 p-3 rounded-lg overflow-x-auto text-[9.5px] font-mono select-all border border-zinc-850 max-h-36">
                          {dbStatus.tableInstructions}
                        </pre>
                        <button
                          onClick={copySQLCode}
                          className="absolute top-2 right-2 p-1.5 rounded-md bg-slate-800 hover:bg-slate-755 text-white transition-all"
                          title="Copiar SQL de criação"
                        >
                          {copiedSql ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5 text-slate-400" />}
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </div>

            </div>

          </div>

          {/* REAL-TIME CLIENT ORDERS DASHBOARD */}
          <div className="mt-20 border-t border-zinc-805 pt-16">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8">
              <div>
                <h3 className="text-2xl font-black text-white tracking-tight" id="orders-dashboard-heading">
                  Painel de Acompanhamento em Tempo Real
                </h3>
                <p className="text-xs text-slate-450">
                  Observe as encomendas que foram guardadas no banco de dados. Qualquer alteração ou exclusão reflete-se instantaneamente.
                </p>
              </div>

              {/* Toggle Admin Control capabilities */}
              <button
                onClick={() => setShowAdminPanel(!showAdminPanel)}
                className={`py-2 px-4 rounded-xl text-xs font-extrabold transition-all duration-150 flex items-center gap-1.5 hover:shadow-md ${
                  showAdminPanel 
                    ? 'bg-zinc-800 border border-zinc-700 text-white hover:bg-zinc-750' 
                    : 'bg-slate-900 border border-zinc-800/80 text-zinc-200 hover:bg-slate-850'
                }`}
                id="toggle-admin-panel"
              >
                <Layers className="w-4 h-4 text-zinc-300" />
                {showAdminPanel ? 'Sair do Modo de Gestor' : 'Modo do Gestor (Simulado)'}
              </button>
            </div>

            {/* Quick stats board */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
              <div className="p-4 bg-[#131B2E] rounded-xl border border-zinc-800 flex flex-col">
                <span className="text-xs font-bold text-slate-400">Total Encomendas</span>
                <span className="text-2xl font-black text-white">{stats.total}</span>
              </div>
              <div className="p-4 bg-slate-950 rounded-xl border border-zinc-850 flex flex-col">
                <span className="text-xs font-bold text-zinc-400">Aguardando Prova (Pendente)</span>
                <span className="text-2xl font-black text-white">{stats.pending}</span>
              </div>
              <div className="p-4 bg-slate-950 rounded-xl border border-zinc-850 flex flex-col">
                <span className="text-xs font-bold text-zinc-450">Fila de Offset (Produção)</span>
                <span className="text-2xl font-black text-white">{stats.production}</span>
              </div>
              <div className="p-4 bg-[#131B2E] rounded-xl border border-zinc-800 flex flex-col">
                <span className="text-xs font-bold text-zinc-400">Concluídas / Prontas</span>
                <span className="text-2xl font-black text-zinc-300">{stats.completed}</span>
              </div>
            </div>

            {/* Connection loading / empty screens */}
            {loadingOrders ? (
              <div className="text-center py-10 space-y-3 bg-slate-900/40 rounded-2xl border border-zinc-800">
                <div className="w-8 h-8 border-4 border-white border-t-transparent rounded-full animate-spin mx-auto"></div>
                <p className="text-xs font-semibold text-[#64748B]">Buscando encomendas do banco de dados relacional...</p>
              </div>
            ) : errorOrders ? (
              <div className="text-center py-10 text-red-400 space-y-2 bg-red-950/20 rounded-2xl border border-red-900/35">
                <AlertCircle className="w-8 h-8 mx-auto" />
                <p className="text-xs font-bold">{errorOrders}</p>
                <button onClick={loadOrdersData} className="text-xs underline font-bold hover:text-red-300">Tentar Recarregar</button>
              </div>
            ) : orders.length === 0 ? (
              <div className="text-center py-12 bg-slate-900/30 rounded-2xl border border-zinc-800 space-y-3">
                <Database className="w-10 h-10 text-slate-500 mx-auto" />
                <div className="space-y-1">
                  <p className="font-extrabold text-sm text-slate-350">Nenhum registro encontrado no banco de dados</p>
                  <p className="text-xs text-slate-500">Preencha o formulário acima para registrar a primeira ordem de produção!</p>
                </div>
              </div>
            ) : (
              <div className="overflow-x-auto bg-[#131B2E] rounded-2xl border border-zinc-800">
                <table className="min-w-full divide-y divide-zinc-800 text-left text-sm">
                  <thead className="bg-[#070A13]">
                    <tr>
                      <th className="px-6 py-4 text-xs font-extrabold text-slate-400 uppercase tracking-widest text-center">Cód/ID</th>
                      <th className="px-6 py-4 text-xs font-extrabold text-slate-400 uppercase tracking-widest">Cliente</th>
                      <th className="px-6 py-4 text-xs font-extrabold text-slate-400 uppercase tracking-widest">Produto Solicitado</th>
                      <th className="px-6 py-4 text-xs font-extrabold text-slate-400 uppercase tracking-widest text-center">Quantidade</th>
                      <th className="px-6 py-4 text-xs font-extrabold text-slate-400 uppercase tracking-widest">Orçamento</th>
                      <th className="px-6 py-4 text-xs font-extrabold text-slate-400 uppercase tracking-widest text-center">Status</th>
                      <th className="px-6 py-4 text-xs font-extrabold text-slate-400 uppercase tracking-widest text-right">Ações</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-zinc-800">
                    {orders.map((order) => {
                      const statusMap: { [key in Order['status']]: { bg: string, text: string, label: string } } = {
                        'Pendente': { bg: 'bg-zinc-800/40 text-zinc-300 border border-zinc-700/50', text: 'text-zinc-300', label: 'Pendente' },
                        'Em Produção': { bg: 'bg-zinc-700/40 text-zinc-300 border border-zinc-600/50', text: 'text-zinc-300', label: 'Na Offset' },
                        'Concluido': { bg: 'bg-zinc-900 text-white border border-zinc-750/80', text: 'text-white', label: 'Concluído' },
                        'Entregue': { bg: 'bg-zinc-950 text-zinc-400 border border-zinc-900', text: 'text-zinc-400', label: 'Entregue' }
                      };

                      const statusDetails = statusMap[order.status] || { bg: 'bg-zinc-800/20 text-slate-400', text: 'text-slate-400', label: order.status };

                      return (
                        <tr key={order.id} className="hover:bg-slate-900/40 transition-colors">
                          
                          {/* ID col */}
                          <td className="px-6 py-4 whitespace-nowrap font-mono font-bold text-center text-zinc-300">
                            {order.id}
                          </td>
                          
                          {/* Client col */}
                          <td className="px-6 py-4">
                            <div className="font-extrabold text-white">{order.client_name}</div>
                            <div className="text-[10px] text-slate-400 font-mono mt-0.5">{order.client_phone}</div>
                          </td>

                          {/* Product col */}
                          <td className="px-6 py-4 font-semibold text-slate-200">
                            <span className="block truncate max-w-xs" title={order.product_type}>
                              {order.product_type}
                            </span>
                            <span className="text-[10px] text-slate-400 block line-clamp-1 italic font-normal" title={order.details}>
                              {order.details || 'Sem especificações.'}
                            </span>
                          </td>

                          {/* Qty col */}
                          <td className="px-6 py-4 text-center font-mono font-bold text-slate-300">
                            {order.quantity.toLocaleString('pt-BR')} un
                          </td>

                          {/* Price col */}
                          <td className="px-6 py-4 whitespace-nowrap font-black text-white">
                            R$ {order.price.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                          </td>

                          {/* Status badge col */}
                          <td className="px-6 py-4 whitespace-nowrap text-center">
                            {showAdminPanel ? (
                              <select
                                value={order.status}
                                onChange={(e) => handleUpdateStatus(order.id, e.target.value as Order['status'])}
                                className="text-xs font-bold border border-zinc-800 bg-slate-950 text-white rounded-lg p-1.5 focus:outline-none focus:ring-1 focus:ring-zinc-500"
                              >
                                <option value="Pendente" className="bg-[#131B2E]">Pendente</option>
                                <option value="Em Produção" className="bg-[#131B2E]">Na Offset</option>
                                <option value="Concluido" className="bg-[#131B2E]">Concluído</option>
                                <option value="Entregue" className="bg-[#131B2E]">Entregue</option>
                              </select>
                            ) : (
                              <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-extrabold ${statusDetails.bg}`}>
                                <span className={`w-1.5 h-1.5 p-0.5 rounded-full mr-1.5 ${
                                  order.status === 'Pendente' ? 'bg-zinc-400' :
                                  order.status === 'Em Produção' ? 'bg-zinc-305' :
                                  order.status === 'Concluido' ? 'bg-white' : 'bg-zinc-650'
                                }`}></span>
                                {statusDetails.label}
                              </span>
                            )}
                          </td>

                          {/* Action tools cols */}
                          <td className="px-6 py-4 whitespace-nowrap text-right text-xs">
                            <div className="flex items-center justify-end gap-2">
                              {/* WhatsApp share btn */}
                              <button
                                onClick={() => shareOrderToWhatsApp(order)}
                                className="bg-[#24d366]/10 text-[#25D366] hover:bg-[#24d366]/20 p-2 border border-[#25D366]/20 rounded-xl transition-all font-bold flex items-center gap-1"
                                title="Enviar detalhes pelo WhatsApp"
                                id={`whatsapp-action-${order.id}`}
                              >
                                <Phone className="w-3.5 h-3.5 fill-[#25D366] text-[#25D366]" />
                                <span className="hidden sm:inline">WhatsApp</span>
                              </button>

                              {/* Admin action: delete order */}
                              {showAdminPanel && (
                                <button
                                  onClick={() => handleDeleteOrder(order.id)}
                                  className="text-red-400 hover:text-red-500 bg-red-950/20 hover:bg-red-950/40 p-2 border border-red-900/30 rounded-xl transition-all"
                                  title="Apagar do Banco de Dados"
                                  id={`delete-action-${order.id}`}
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                </button>
                              )}
                            </div>
                          </td>

                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>

        </div>
      </section>

      {/* CONTATO POR EMAIL & ENDEREÇO SECTION */}
      <section className="py-20 md:py-28 bg-[#090D16] border-t border-zinc-850" id="contato">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
            
            {/* Info details */}
            <div className="lg:col-span-5 space-y-8">
              <div className="space-y-4">
                <h2 className="text-xs uppercase font-extrabold tracking-widest text-[#B4B4B4]">Atendimento Premium</h2>
                <h3 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
                  Prontos para Atender Sua Empresa
                </h3>
                <p className="text-slate-350 text-sm leading-relaxed">
                  Trabalhamos tanto com pequenas tiragens de gráfica rápida quanto com grandes contratos de fornecimento constante de embalagens e impressos corporativos. Escolha falar por e-mail ou venha nos visitar!
                </p>
              </div>

              {/* Technical / Operations Markers */}
              <div className="space-y-4 bg-[#131B2E] p-6 rounded-2xl border border-zinc-800">
                
                <div className="flex items-start gap-3.5 border-b border-zinc-850 pb-4">
                  <span className="w-10 h-10 rounded-xl bg-slate-900 border border-zinc-800 flex items-center justify-center text-zinc-300 flex-shrink-0">
                    <MapPin className="w-5 h-5" />
                  </span>
                  <div>
                    <span className="font-extrabold text-sm block text-white">Nosso Parque Gráfico</span>
                    <span className="text-xs text-slate-450 block">Av. Paulista, 1000 - Bela Vista, São Paulo - SP, 01310-100</span>
                  </div>
                </div>

                <div className="flex items-start gap-3.5 border-b border-zinc-850 pb-4">
                  <span className="w-10 h-10 rounded-xl bg-slate-900 border border-zinc-800 flex items-center justify-center text-zinc-300 flex-shrink-0">
                    <Clock className="w-5 h-5" />
                  </span>
                  <div>
                    <span className="font-extrabold text-sm block text-white">Horário de Funcionamento</span>
                    <span className="text-xs text-slate-450 block">Segunda a Sexta: 08:00 às 18:30 | Sábado: 09:00 às 13:00</span>
                  </div>
                </div>

                <div className="flex items-start gap-3.5">
                  <span className="w-10 h-10 rounded-xl bg-slate-900 border border-zinc-800 flex items-center justify-center text-[#25D366] flex-shrink-0">
                    <Phone className="w-5 h-5 fill-[#25D366] text-[#25D366]" />
                  </span>
                  <div>
                    <span className="font-extrabold text-sm block text-white">WhatsApp Comercial</span>
                    <span className="text-xs text-slate-450 block">(11) 99999-9999 / (11) 3254-0000</span>
                  </div>
                </div>

              </div>
            </div>

            {/* Email Contact Form */}
            <div className="lg:col-span-7 bg-[#131B2E] rounded-2xl border border-zinc-800 p-6 sm:p-8 shadow-2xl">
              
              <h3 className="text-xl font-extrabold text-white mb-6 flex items-center gap-2" id="contact-form-title">
                <Mail className="w-5 h-5 text-zinc-300" />
                Dúvidas ou Solicitações por E-mail
              </h3>

              <form onSubmit={handleContactSubmit} className="space-y-4">
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* Name */}
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-300 block" htmlFor="contact-name">Seu Nome</label>
                    <input 
                      type="text" 
                      id="contact-name"
                      required
                      value={contactData.name}
                      onChange={(e) => setContactData(p => ({ ...p, name: e.target.value }))}
                      placeholder="Ex: Pedro Henrique"
                      className="w-full rounded-xl border border-zinc-805 bg-[#070A13] text-white text-sm px-4 py-3 focus:outline-none focus:ring-2 focus:ring-zinc-800 focus:border-zinc-500"
                    />
                  </div>

                  {/* Email */}
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-300 block" htmlFor="contact-email">Seu E-mail</label>
                    <input 
                      type="email" 
                      id="contact-email"
                      required
                      value={contactData.email}
                      onChange={(e) => setContactData(p => ({ ...p, email: e.target.value }))}
                      placeholder="Ex: pedro@email.com"
                      className="w-full rounded-xl border border-zinc-805 bg-[#070A13] text-white text-sm px-4 py-3 focus:outline-none focus:ring-2 focus:ring-zinc-800 focus:border-zinc-500"
                    />
                  </div>
                </div>

                {/* Subject */}
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-300 block" htmlFor="contact-subject">Assunto da Mensagem</label>
                  <input 
                    type="text" 
                    id="contact-subject"
                    value={contactData.subject}
                    onChange={(e) => setContactData(p => ({ ...p, subject: e.target.value }))}
                    placeholder="Ex: Orçamento Especial para Sacolas de Natal"
                    className="w-full rounded-xl border border-zinc-805 bg-[#070A13] text-white text-sm px-4 py-3 focus:outline-none focus:ring-2 focus:ring-zinc-800 focus:border-zinc-500"
                  />
                </div>

                {/* Message text */}
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-300 block" htmlFor="contact-message">Sua Mensagem</label>
                  <textarea 
                    id="contact-message"
                    required
                    rows={4}
                    value={contactData.message}
                    onChange={(e) => setContactData(p => ({ ...p, message: e.target.value }))}
                    placeholder="Escreva sua mensagem com riqueza de detalhes para agilizarmos seu atendimento..."
                    className="w-full rounded-xl border border-zinc-805 bg-[#070A13] text-white text-sm px-4 py-3 focus:outline-none focus:ring-2 focus:ring-zinc-800 focus:border-zinc-500"
                  />
                </div>

                {/* Success alert message */}
                {emailSuccess && (
                  <div className="p-4 bg-emerald-950/20 border border-emerald-850 rounded-xl text-xs text-emerald-300 space-y-1 animate-fadeIn" id="mail-success-alert">
                    <span className="font-extrabold block">✓ E-mail gerado com sucesso!</span>
                    <p>Responderemos sua mensagem no endereço fornecido em no máximo 2 horas comerciais.</p>
                  </div>
                )}

                {emailError && (
                  <div className="p-4 bg-red-950/20 border border-red-800 rounded-xl text-xs text-red-355 animate-fadeIn">
                    <span className="font-extrabold block">⚠ Falha no envio</span>
                    <p>Por favor, preencha todos os campos obrigatórios (*).</p>
                  </div>
                )}

                <button
                  type="submit"
                  className="w-full py-3.5 bg-zinc-800 hover:bg-zinc-700 border border-zinc-700 text-white font-extrabold tracking-wide rounded-xl text-sm transition-all flex items-center justify-center gap-2 active:scale-95 shadow-sm"
                  id="submit-contact-email-btn"
                >
                  <Send className="w-4 h-4 text-zinc-300" />
                  Enviar E-mail Comercial
                </button>

              </form>

            </div>

          </div>

        </div>
      </section>

      {/* FOOTER */}
      <footer className="bg-slate-950 text-slate-400 py-12 border-t border-zinc-900 text-sm" id="footer-details">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
          
          <div className="flex flex-col md:flex-row items-center justify-between gap-6 pb-8 border-b border-zinc-900">
            <div className="flex items-center gap-3">
              <div className="relative flex items-center justify-center w-9 h-9 rounded-lg bg-white/5 overflow-hidden border border-zinc-800">
                <span className="absolute top-0.5 left-1 w-2.5 h-2.5 rounded-full bg-zinc-300"></span>
                <span className="absolute bottom-0.5 right-1 w-2.5 h-2.5 rounded-full bg-zinc-400"></span>
                <span className="absolute bottom-0.5 left-1 w-2.5 h-2.5 rounded-full bg-zinc-500"></span>
              </div>
              <span className="font-black text-white text-lg tracking-tight">
                ArtImpressa
              </span>
            </div>

            <p className="text-xs text-slate-500">
              © {new Date().getFullYear()} ArtImpressa Gráfica S/A. CNPJ: 12.345.678/0001-99. Todos os direitos reservados.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="space-y-3 ms-0">
              <span className="font-extrabold text-white text-xs uppercase tracking-wider block">Garantia e Padrão</span>
              <p className="text-xs leading-relaxed text-slate-500">
                Garantimos correspondência mínima de 95% na escala Pantone ou espectro CMYK. Provas de cores digitais são submetidas antes de rodagens corporativas de grande volume.
              </p>
            </div>
            <div className="space-y-2">
              <span className="font-extrabold text-white text-xs uppercase tracking-wider block">Navegação Rápida (Estilo Âncora)</span>
              <div className="grid grid-cols-2 gap-2 text-xs">
                <a href="#home" className="hover:text-white transition-colors">Voltar ao Início</a>
                <a href="#servicos" className="hover:text-white transition-colors">Ver Serviços</a>
                <a href="#galeria" className="hover:text-white transition-colors">Galeria de Fotos</a>
                <a href="#encomenda" className="hover:text-white transition-colors">Encomendas</a>
              </div>
            </div>
            <div className="space-y-3">
              <span className="font-extrabold text-white text-xs uppercase tracking-wider block">Suporte Corporativo VIP</span>
              <p className="text-xs text-slate-500">
                Caso sua empresa precise de canais via faturamento em boleto corporativo (30 dias) ou integrações API de Web-to-print, fale direto com nossos diretores comerciais.
              </p>
            </div>
          </div>

        </div>
      </footer>

      {/* FLOATING WHATSAPP CHAT CHIP */}
      <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end gap-2 group">
        <div className="scale-0 group-hover:scale-100 transition-all duration-200 origin-bottom-right bg-[#131B2E] p-3 rounded-2xl shadow-2xl border border-zinc-800 text-xs text-slate-100 font-extrabold max-w-sm flex items-center gap-2 mb-1 cursor-pointer" onClick={triggerGeneralWhatsApp} id="whatsapp-floating-bubble-text">
          <span className="relative flex h-2.5 w-2.5">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
          </span>
          Precisa de orçamento sob medida? Fale conosco online!
        </div>
        
        <button
          onClick={triggerGeneralWhatsApp}
          className="w-16 h-16 bg-[#25D366] hover:bg-[#20ba5a] text-white flex items-center justify-center rounded-full shadow-2xl transition-all duration-300 hover:scale-110 relative group border-2 border-white"
          title="Fale conosco no WhatsApp"
          id="whatsapp-floating-btn"
        >
          <Phone className="w-7 h-7 fill-white text-white" />
          <span className="absolute -top-1.5 -right-1.5 flex h-5 w-5 items-center justify-center rounded-full bg-zinc-800 border border-zinc-700 text-[10px] text-white font-black animate-bounce font-mono">
            1
          </span>
        </button>
      </div>

    </div>
  );
}
