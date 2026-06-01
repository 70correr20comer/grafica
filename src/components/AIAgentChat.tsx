import React, { useState, useRef, useEffect } from "react";
import { MessageCircle, X, Send, Bot, Sparkles, RefreshCw, AlertCircle, HelpCircle } from "lucide-react";
import { Order } from "../supabase";

interface Message {
  role: "user" | "assistant" | "system";
  content: string;
}

interface AIAgentChatProps {
  orders: Order[];
}

export default function AIAgentChat({ orders }: AIAgentChatProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    {
      role: "assistant",
      content: "Olá! Sou o **Artie**, assistente inteligente da ArtImpressa. Posso tirar dúvidas sobre prazos, especificações de produtos, como fazer novos pedidos ou **consultar o status da sua encomenda em tempo real**! Como posso ajudar você hoje?"
    }
  ]);
  const [inputMessage, setInputMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [needsApiKey, setNeedsApiKey] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to the bottom when new message arrives
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isLoading]);

  const handleSendMessage = async (textToSend?: string) => {
    const text = textToSend || inputMessage;
    if (!text.trim() || isLoading) return;

    if (!textToSend) {
      setInputMessage("");
    }

    const newUserMessage: Message = { role: "user", content: text };
    const updatedMessages = [...messages, newUserMessage];
    setMessages(updatedMessages);
    setIsLoading(true);
    setErrorMessage(null);

    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          // Send raw messages excluding the initial assistant greeting to keep prompt concise
          messages: updatedMessages.map(msg => ({ role: msg.role, content: msg.content })),
          ordersContext: orders
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        if (errorData.status === "needs_key") {
          setNeedsApiKey(true);
          const assistantReply: Message = {
            role: "assistant",
            content: "⚠️ **Chave API do Groq pendente de configuração.** Por favor, configure a variável `GROQ_API_KEY` nos **Segredos** do painel lateral do AI Studio para ativar as respostas de inteligência artificial!"
          };
          setMessages(prev => [...prev, assistantReply]);
          return;
        }
        throw new Error(errorData.error || "Erro de comunicação com o servidor de IA.");
      }

      const score = await response.json();
      const choice = score.choices?.[0];
      const replyContent = choice?.message?.content || "Desculpe, não consegui processar uma resposta agora.";

      setMessages(prev => [...prev, { role: "assistant", content: replyContent }]);

    } catch (err: any) {
      console.error("Erro ao enviar mensagem:", err);
      setErrorMessage(err.message || "Ocorreu um erro ao processar sua pergunta.");
      setMessages(prev => [
        ...prev,
        {
          role: "assistant",
          content: "❌ **Erro de conexão**: Não foi possível contatar o serviço de inteligência artificial. Verifique se o servidor está ativo."
        }
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const clearChat = () => {
    setMessages([
      {
        role: "assistant",
        content: "Chat reiniciado! Pergunte-me qualquer dúvida sobre a gráfica, produtos, ou digite seu Nome/ID de encomenda para buscar informações."
      }
    ]);
    setNeedsApiKey(false);
    setErrorMessage(null);
  };

  const handleQuickQuestion = (question: string) => {
    handleSendMessage(question);
  };

  // Quick suggestions
  const SUGGESTIONS = [
    { text: "Comprar Cartões de Visita", label: "📄 Cartão de Visita?" },
    { text: "Qual status do pedido?", label: "🔍 Status do meu Pedido" },
    { text: "Quais produtos vocês oferecem?", label: "📦 Catálogo de Produtos" },
    { text: "Qual o telefone e endereço?", label: "📍 Localização & Contatos" }
  ];

  return (
    <>
      {/* FLOATING ACTION CHIP AND BUTTON */}
      <div className="fixed bottom-6 right-24 z-50 flex flex-col items-end gap-2 group">
        
        {/* Floating Bubble Preview */}
        {!isOpen && (
          <div 
            onClick={() => setIsOpen(true)}
            className="hidden sm:flex items-center gap-2 px-3 py-2.5 rounded-2xl bg-[#131B2E] text-slate-100 font-extrabold text-[11px] shadow-2xl border border-zinc-800 cursor-pointer animate-pulse hover:border-zinc-500 hover:scale-105 transition-all duration-200"
          >
            <Bot className="w-4 h-4 text-zinc-300 animate-bounce" />
            <span>Fale com o Artie (Suporte IA)</span>
          </div>
        )}

        {/* The Action Trigger Button */}
        <button
          onClick={() => setIsOpen(!isOpen)}
          className={`flex items-center justify-center w-14 h-14 rounded-full shadow-2xl text-white transition-all transform hover:scale-110 active:scale-95 ${
            isOpen ? "bg-red-950/80 border border-red-800 text-red-100 rotate-90" : "bg-gradient-to-tr from-slate-900 via-indigo-950 to-[#131B2E] border border-zinc-800/80 hover:border-zinc-600"
          }`}
          title="Fale com nosso Assistente de IA"
          id="chat-toggle-button"
        >
          {isOpen ? (
            <X className="w-6 h-6" />
          ) : (
            <div className="relative">
              <Bot className="w-7 h-7" />
              <span className="absolute -top-1 -right-1 flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-indigo-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-indigo-500"></span>
              </span>
            </div>
          )}
        </button>
      </div>

      {/* CHAT WIDGET INTERFACE PANEL */}
      {isOpen && (
        <div 
          className="fixed bottom-24 right-4 sm:right-6 md:right-8 w-[calc(100vw-32px)] sm:w-[410px] h-[550px] max-h-[80vh] bg-[#0C101F] rounded-2xl border border-zinc-800 shadow-2xl flex flex-col overflow-hidden z-50 animate-fadeIn"
          id="ai-chat-agent-panel"
        >
          {/* Header */}
          <div className="p-4 bg-[#131B2E] border-b border-zinc-800 flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-slate-950 border border-zinc-800 flex items-center justify-center text-zinc-300">
                <Bot className="w-5 h-5" />
              </div>
              <div>
                <div className="flex items-center gap-1.5">
                  <h4 className="text-sm font-black text-white">Artie Chat</h4>
                  <span className="px-1.5 py-0.5 text-[9px] font-black uppercase tracking-wider bg-zinc-800 text-zinc-350 border border-zinc-700/60 rounded">Atendente IA</span>
                </div>
                <p className="text-[10px] text-emerald-450 flex items-center gap-1 font-mono">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                  Conectado à Groq / Supabase
                </p>
              </div>
            </div>
            
            <div className="flex items-center gap-2">
              <button 
                onClick={clearChat}
                className="p-1.5 rounded-lg hover:bg-slate-950/60 text-slate-400 hover:text-white transition-colors"
                title="Limpar Histórico"
              >
                <RefreshCw className="w-4 h-4" />
              </button>
              <button 
                onClick={() => setIsOpen(false)}
                className="p-1.5 rounded-lg hover:bg-slate-950/60 text-slate-400 hover:text-white transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Database Insight Banner */}
          <div className="bg-[#090D16] px-4 py-2 border-b border-zinc-800/80 flex items-center justify-between text-[11px] text-zinc-400 font-medium">
            <div className="flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-amber-400" />
              <span>Sincronizado com <strong>{orders.length}</strong> encomendas</span>
            </div>
            <span className="text-[10px] text-slate-500 font-mono">Llama-3.1 API</span>
          </div>

          {/* Message Area */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-[#090B14]/80">
            {messages.map((msg, index) => (
              <div 
                key={index} 
                className={`flex gap-3 max-w-[85%] ${
                  msg.role === "user" ? "ms-auto flex-row-reverse" : "me-auto"
                }`}
              >
                {/* Avatar */}
                {msg.role !== "user" && (
                  <div className="w-7 h-7 rounded-lg bg-slate-950 border border-zinc-800/85 flex items-center justify-center text-zinc-400 shrink-0 select-none">
                    <Bot className="w-4 h-4" />
                  </div>
                )}

                {/* Msg text bubble */}
                <div 
                  className={`rounded-2xl p-3 text-xs leading-relaxed ${
                    msg.role === "user" 
                      ? "bg-zinc-800 text-white rounded-tr-none px-4" 
                      : "bg-[#131B2E] text-slate-300 rounded-tl-none border border-zinc-800/50"
                  }`}
                >
                  {/* Handle basic Markdown formatting */}
                  <div className="space-y-1.5 whitespace-pre-wrap">
                    {msg.content.split("\n").map((line, lIndex) => {
                      // Format bold markdown (**text**)
                      const formattedLine = line.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
                      return (
                        <p 
                          key={lIndex} 
                          dangerouslySetInnerHTML={{ __html: formattedLine }}
                        />
                      );
                    })}
                  </div>
                </div>
              </div>
            ))}

            {/* Loading Indicator */}
            {isLoading && (
              <div className="flex gap-3 items-center max-w-[85%] me-auto">
                <div className="w-7 h-7 rounded-lg bg-slate-950 border border-zinc-800/85 flex items-center justify-center text-zinc-400 shrink-0 animate-pulse">
                  <Bot className="w-4 h-4 animate-spin" />
                </div>
                <div className="rounded-2xl p-3 bg-[#131B2E] text-slate-400 rounded-tl-none border border-zinc-800/50 text-xs flex items-center gap-1.5 font-sans">
                  <span className="w-1.5 h-1.5 rounded-full bg-zinc-400 animate-bounce"></span>
                  <span className="w-1.5 h-1.5 rounded-full bg-zinc-400 animate-bounce [animation-delay:0.2s]"></span>
                  <span className="w-1.5 h-1.5 rounded-full bg-zinc-300 animate-bounce [animation-delay:0.4s]"></span>
                  <span>Artie está digitando...</span>
                </div>
              </div>
            )}

            {/* Error alerts inside chat box */}
            {errorMessage && (
              <div className="p-3 bg-red-950/25 border border-red-900/60 rounded-xl text-[10.5px] text-red-350 flex items-start gap-2">
                <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                <div>
                  <span className="font-extrabold block mb-0.5">Falha operacional</span>
                  <p>{errorMessage}</p>
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Quick Suggestions Chips */}
          <div className="px-4 py-2 bg-slate-950/60 border-t border-zinc-850/60 overflow-x-auto whitespace-nowrap flex gap-2 scrollbar-none">
            {SUGGESTIONS.map((s, idx) => (
              <button
                key={idx}
                onClick={() => handleQuickQuestion(s.text)}
                disabled={isLoading}
                className="inline-flex shrink-0 items-center justify-center px-3 py-1.5 rounded-full bg-zinc-900 hover:bg-zinc-800 text-slate-300 border border-zinc-800/80 text-[10px] hover:text-white transition-all disabled:opacity-50"
              >
                {s.label}
              </button>
            ))}
          </div>

          {/* User Input controls */}
          <form 
            onSubmit={(e) => {
              e.preventDefault();
              handleSendMessage();
            }}
            className="p-3 bg-[#131B2E] border-t border-zinc-800 flex items-center gap-2"
          >
            <input
              type="text"
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              placeholder={needsApiKey ? "Insira a chave na barra Studio..." : "Pergunte algo ao Artie..."}
              disabled={isLoading}
              className="flex-1 bg-slate-950 text-white rounded-xl border border-zinc-805 text-xs px-3.5 py-2.5 focus:outline-none focus:ring-1 focus:ring-zinc-600 focus:border-zinc-500 disabled:opacity-60"
            />
            <button
              type="submit"
              disabled={!inputMessage.trim() || isLoading}
              className="w-[36px] h-[36px] shrink-0 bg-zinc-800 hover:bg-zinc-700 text-white flex items-center justify-center rounded-xl transition-colors disabled:opacity-40 disabled:hover:bg-zinc-800"
            >
              <Send className="w-4 h-4 text-zinc-300" />
            </button>
          </form>
        </div>
      )}
    </>
  );
}
