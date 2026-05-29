import { createClient } from '@supabase/supabase-js';

// Get environment variables for Supabase
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

// Initialize Supabase check
const isSupabaseConfigured = !!(supabaseUrl && supabaseUrl !== 'https://your-project.supabase.co' && supabaseAnonKey && supabaseAnonKey !== 'your-anon-role-key');

export const supabase = isSupabaseConfigured
  ? createClient(supabaseUrl, supabaseAnonKey)
  : null;

export interface Order {
  id: string;
  client_name: string;
  client_email: string;
  client_phone: string;
  product_type: string;
  quantity: number;
  details: string;
  price: number;
  status: 'Pendente' | 'Em Produção' | 'Concluido' | 'Entregue';
  created_at: string;
}

// Default mock base orders if localStorage is empty
const DEFAULT_ORDERS: Order[] = [
  {
    id: 'ord-101',
    client_name: 'Carlos Oliveira',
    client_email: 'carlos.oliveira@email.com',
    client_phone: '11999998888',
    product_type: 'Cartão de Visita Premium',
    quantity: 1000,
    details: 'Cartão frente e verso, papel couchê 300g com verniz localizado.',
    price: 120.00,
    status: 'Pendente',
    created_at: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString() // 2 days ago
  },
  {
    id: 'ord-102',
    client_name: 'Mariana Costa Consultoria',
    client_email: 'contato@marianacosta.com.br',
    client_phone: '21988887777',
    product_type: 'Panfletos Divulgação',
    quantity: 5000,
    details: 'Panfleto Couchê 90g, 10x14cm, colorido apenas frente.',
    price: 280.00,
    status: 'Em Produção',
    created_at: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString() // 1 day ago
  }
];

// Helper to get local storage orders
function getLocalStorageOrders(): Order[] {
  const data = localStorage.getItem('artimpressa_orders');
  if (!data) {
    localStorage.setItem('artimpressa_orders', JSON.stringify(DEFAULT_ORDERS));
    return DEFAULT_ORDERS;
  }
  try {
    return JSON.parse(data);
  } catch (e) {
    return DEFAULT_ORDERS;
  }
}

// Helper to set local storage orders
function setLocalStorageOrders(orders: Order[]) {
  localStorage.setItem('artimpressa_orders', JSON.stringify(orders));
}

export async function fetchOrders(): Promise<Order[]> {
  if (supabase) {
    try {
      const { data, error } = await supabase
        .from('encomendas')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (error) {
        console.error('Erro ao buscar dados do Supabase, usando localStorage como fallback:', error);
        return getLocalStorageOrders();
      }
      return data as Order[];
    } catch (err) {
      console.error('Erro crítico Supabase, usando localStorage:', err);
      return getLocalStorageOrders();
    }
  } else {
    // Return sorted orders from localStorage (newest first)
    const orders = getLocalStorageOrders();
    return [...orders].sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
  }
}

export async function saveOrder(orderData: Omit<Order, 'id' | 'created_at' | 'status' | 'price'>): Promise<Order> {
  const generatedId = `ord-${Math.floor(100 + Math.random() * 900)}`;
  const pricesMap: { [key: string]: number } = {
    'Cartão de Visita': 0.12, // R$ 0.12 por unidade
    'Panfleto': 0.06,
    'Banner': 45.00, // R$ 45.00 por metro/unidade
    'Adesivo': 0.50,
    'Brinde/Agenda': 25.00
  };
  
  // Calculate a generic price based on product type
  let basePrice = 45.00;
  for (const key of Object.keys(pricesMap)) {
    if (orderData.product_type.includes(key)) {
      basePrice = pricesMap[key];
      break;
    }
  }
  const computedPrice = orderData.product_type.includes('Banner') || orderData.product_type.includes('Brinde')
    ? basePrice * orderData.quantity
    : Math.max(45, basePrice * orderData.quantity); // Mínimo de R$ 45

  const newOrder: Order = {
    ...orderData,
    id: generatedId,
    price: parseFloat(computedPrice.toFixed(2)),
    status: 'Pendente',
    created_at: new Date().toISOString()
  };

  if (supabase) {
    try {
      const { data, error } = await supabase
        .from('encomendas')
        .insert([newOrder])
        .select()
        .single();
      
      if (error) {
        console.error('Erro ao salvar no Supabase, salvando localmente:', error);
        const localOrders = getLocalStorageOrders();
        localOrders.push(newOrder);
        setLocalStorageOrders(localOrders);
        return newOrder;
      }
      return data as Order;
    } catch (err) {
      console.error('Erro de conexão Supabase ao salvar, salvando localmente:', err);
      const localOrders = getLocalStorageOrders();
      localOrders.push(newOrder);
      setLocalStorageOrders(localOrders);
      return newOrder;
    }
  } else {
    const localOrders = getLocalStorageOrders();
    localOrders.push(newOrder);
    setLocalStorageOrders(localOrders);
    return newOrder;
  }
}

export async function updateOrderStatus(id: string, newStatus: Order['status']): Promise<boolean> {
  if (supabase) {
    try {
      const { error } = await supabase
        .from('encomendas')
        .update({ status: newStatus })
        .eq('id', id);
        
      if (error) {
        console.error('Erro ao atualizar status no Supabase:', error);
        return updateLocalStorageStatus(id, newStatus);
      }
      return true;
    } catch (err) {
      console.error('Erro de conexão Supabase, atualizando localmente:', err);
      return updateLocalStorageStatus(id, newStatus);
    }
  } else {
    return updateLocalStorageStatus(id, newStatus);
  }
}

function updateLocalStorageStatus(id: string, status: Order['status']): boolean {
  const localOrders = getLocalStorageOrders();
  const index = localOrders.findIndex(o => o.id === id);
  if (index !== -1) {
    localOrders[index] = { ...localOrders[index], status };
    setLocalStorageOrders(localOrders);
    return true;
  }
  return false;
}

export async function deleteOrder(id: string): Promise<boolean> {
  if (supabase) {
    try {
      const { error } = await supabase
        .from('encomendas')
        .delete()
        .eq('id', id);
        
      if (error) {
        console.error('Erro ao deletar do Supabase:', error);
        return deleteLocalStorageOrder(id);
      }
      return true;
    } catch (err) {
      console.error('Erro de conexão Supabase ao deletar, removendo localmente:', err);
      return deleteLocalStorageOrder(id);
    }
  } else {
    return deleteLocalStorageOrder(id);
  }
}

function deleteLocalStorageOrder(id: string): boolean {
  const localOrders = getLocalStorageOrders();
  const filtered = localOrders.filter(o => o.id !== id);
  if (filtered.length !== localOrders.length) {
    setLocalStorageOrders(filtered);
    return true;
  }
  return false;
}

export function getDatabaseStatus(): { isCloud: boolean; message: string; tableInstructions?: string } {
  if (isSupabaseConfigured) {
    return {
      isCloud: true,
      message: 'Conectado ao Banco de Dados Supabase (Nuvem)'
    };
  }
  return {
    isCloud: false,
    message: 'Armazenamento Local Ativo (Vite Preview)',
    tableInstructions: `Crie a tabela "encomendas" no console do seu Supabase com a seguinte estrutura SQL:
    
create table encomendas (
  id text primary key,
  client_name text not null,
  client_email text not null,
  client_phone text not null,
  product_type text not null,
  quantity integer not null,
  details text,
  price numeric,
  status text not null default 'Pendente',
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);`
  };
}
