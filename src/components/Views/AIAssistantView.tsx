import React, { useState, useEffect } from 'react';
import { MessageSquare, Send, Loader2, Sprout, CloudSun, Sparkles } from 'lucide-react';
import { Crop, WeatherData } from '../../types';
import { aiService } from '../../services/aiService';
import { useLanguage } from '../../context/LanguageContext';

interface AIAssistantViewProps {
  userCrops: Crop[];
  weather?: WeatherData | null;
  initialQuery?: string;
}

interface ChatMessage {
  sender: 'user' | 'ai';
  text: string;
  time: string;
}

const SAMPLE_PROMPTS_EN = [
  'What organic fertilizer is best for tomatoes?',
  'How to treat aphids in cotton field?',
  'Should I irrigate my crops today given current weather?',
  'Best foliar spray timing for pest prevention'
];

const SAMPLE_PROMPTS_TE = [
  'టమాటా పంటకు ఏ సేంద్రీయ ఎరువు ఉత్తమం?',
  'పత్తిలో పేనుబంక నివారణ ఎలా చేయాలి?',
  'ప్రస్తుత వాతావరణంలో పంటకు నీరు పెట్టవచ్చా?',
  'పురుగుల నివారణకు పిచికారీ ఎప్పుడు చేయాలి?'
];

export const AIAssistantView: React.FC<AIAssistantViewProps> = ({
  userCrops,
  weather,
  initialQuery = ''
}) => {
  const { t, language } = useLanguage();
  const isTelugu = language === 'te';

  const getInitialGreeting = (lang: string) => {
    if (lang === 'te') {
      return `నమస్కారం! నేను మీ **AgriAI** వ్యవసాయ సహాయకుడిని. మీ ${weather?.location ? `ప్రాంతం (${weather.location})` : 'పొలం'} మరియు ${userCrops.length} నమోదైన పంటల వివరాలను పరిశీలిస్తున్నాను. ఈరోజు మీ వ్యవసాయానికి నేను ఏ విధంగా సహాయపడగలను?`;
    }
    return `Hello Charan! I'm **AgriAI**, your dedicated farm intelligence agent. I'm actively tracking ${weather?.location ? `your location (${weather.location})` : 'your farm'} and your ${userCrops.length} registered crop(s). How can I assist your farm today?`;
  };

  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      sender: 'ai',
      text: getInitialGreeting(language),
      time: t('common.justNow')
    }
  ]);

  useEffect(() => {
    setMessages((prev) => {
      if (prev.length === 1 && prev[0].sender === 'ai') {
        return [{ sender: 'ai', text: getInitialGreeting(language), time: t('common.justNow') }];
      }
      return prev;
    });
  }, [language]);

  const [input, setInput] = useState(initialQuery);
  const [loading, setLoading] = useState(false);

  const samplePrompts = isTelugu ? SAMPLE_PROMPTS_TE : SAMPLE_PROMPTS_EN;

  const handleSend = async (textToSend?: string) => {
    const query = textToSend || input;
    if (!query.trim()) return;

    const userMsg: ChatMessage = { sender: 'user', text: query, time: t('common.justNow') };
    setMessages((prev) => [...prev, userMsg]);
    setInput('');
    setLoading(true);

    try {
      const res = await aiService.askAgriAI(query, userCrops, weather || undefined, language);
      setMessages((prev) => [
        ...prev,
        {
          sender: 'ai',
          text: res.reply,
          time: t('common.justNow')
        }
      ]);
    } catch {
      setMessages((prev) => [
        ...prev,
        {
          sender: 'ai',
          text: isTelugu
            ? "చిన్న కనెక్షన్ సమస్య ఏర్పడింది. దయచేసి మీ ఇంటర్నెట్ కనెక్షన్‌ను తనిఖీ చేసి మళ్లీ ప్రయత్నించండి."
            : "I'm having a brief connection issue. Please check your connectivity and try again.",
          time: t('common.justNow')
        }
      ]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: 'calc(100vh - 120px)', gap: '16px' }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '10px' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div
              style={{
                width: '36px',
                height: '36px',
                borderRadius: '10px',
                backgroundColor: '#e8f5ec',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#155e32'
              }}
            >
              <MessageSquare size={20} />
            </div>
            <h2 style={{ fontSize: '1.45rem', fontWeight: 800, color: 'var(--text-main)' }}>
              {t('aiAssistant.title')}
            </h2>
          </div>
          <p style={{ fontSize: '0.84rem', color: 'var(--text-muted)' }}>
            {t('aiAssistant.subtitle')}
          </p>
        </div>

        {/* Active Context Chips */}
        <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
          <span
            style={{
              fontSize: '0.76rem',
              fontWeight: 600,
              backgroundColor: '#edf7ed',
              color: '#155e32',
              padding: '4px 10px',
              borderRadius: '20px',
              display: 'flex',
              alignItems: 'center',
              gap: '5px'
            }}
          >
            <Sprout size={13} /> {userCrops.length} {isTelugu ? 'నమోదైన పంటలు' : 'Registered Crops'}
          </span>
          <span
            style={{
              fontSize: '0.76rem',
              fontWeight: 600,
              backgroundColor: '#f1f5f9',
              color: '#334155',
              padding: '4px 10px',
              borderRadius: '20px',
              display: 'flex',
              alignItems: 'center',
              gap: '5px'
            }}
          >
            <CloudSun size={13} /> {weather ? `${weather.location} (${weather.temp}°C)` : (isTelugu ? 'ప్రత్యక్ష వాతావరణం' : 'Live Weather')}
          </span>
        </div>
      </div>

      {/* Main Chat Window Card */}
      <div
        className="agri-card"
        style={{
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          padding: '20px 24px',
          overflow: 'hidden'
        }}
      >
        {/* Messages Stream */}
        <div
          style={{
            flex: 1,
            overflowY: 'auto',
            display: 'flex',
            flexDirection: 'column',
            gap: '14px',
            paddingRight: '6px',
            marginBottom: '14px'
          }}
        >
          {messages.map((msg, idx) => {
            const isUser = msg.sender === 'user';
            return (
              <div
                key={idx}
                style={{
                  display: 'flex',
                  justifyContent: isUser ? 'flex-end' : 'flex-start',
                  width: '100%'
                }}
              >
                <div
                  style={{
                    maxWidth: '82%',
                    padding: '14px 18px',
                    borderRadius: isUser ? '20px 20px 4px 20px' : '20px 20px 20px 4px',
                    backgroundColor: isUser ? '#155e32' : '#f8faf9',
                    color: isUser ? '#ffffff' : 'var(--text-main)',
                    border: isUser ? 'none' : '1.5px solid #e1eee4',
                    fontSize: '0.89rem',
                    lineHeight: 1.55,
                    whiteSpace: 'pre-line',
                    boxShadow: isUser ? '0 3px 12px rgba(21, 94, 50, 0.15)' : '0 2px 8px rgba(0, 0, 0, 0.03)'
                  }}
                >
                  <p style={{ margin: 0 }}>{msg.text}</p>
                  
                  <span
                    style={{
                      display: 'block',
                      fontSize: '0.68rem',
                      marginTop: '6px',
                      textAlign: isUser ? 'right' : 'left',
                      color: isUser ? 'rgba(255, 255, 255, 0.75)' : '#7a8e80'
                    }}
                  >
                    {msg.time}
                  </span>
                </div>
              </div>
            );
          })}

          {loading && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', color: '#155e32', fontSize: '0.84rem', padding: '10px 14px', backgroundColor: '#f0fdf4', borderRadius: '12px', width: 'fit-content' }}>
              <Loader2 size={16} className="animate-spin" />
              <span>{t('aiAssistant.thinking')}</span>
            </div>
          )}
        </div>

        {/* Suggested Prompts */}
        <div style={{ marginBottom: '12px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '8px' }}>
            <Sparkles size={13} color="#155e32" />
            <span style={{ fontSize: '0.74rem', fontWeight: 700, color: 'var(--text-muted)' }}>
              {t('aiAssistant.suggestionsTitle')}
            </span>
          </div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
            {samplePrompts.map((prompt, i) => (
              <button
                key={i}
                onClick={() => handleSend(prompt)}
                style={{
                  background: '#ffffff',
                  border: '1px solid var(--border-subtle)',
                  borderRadius: '16px',
                  padding: '5px 12px',
                  fontSize: '0.78rem',
                  color: 'var(--text-body)',
                  cursor: 'pointer',
                  transition: 'all var(--transition-fast)'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.borderColor = '#155e32';
                  e.currentTarget.style.backgroundColor = '#f7faf7';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.borderColor = 'var(--border-subtle)';
                  e.currentTarget.style.backgroundColor = '#ffffff';
                }}
              >
                {prompt}
              </button>
            ))}
          </div>
        </div>

        {/* Input Form */}
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSend();
          }}
          style={{ display: 'flex', gap: '10px' }}
        >
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder={t('aiAssistant.inputPlaceholder')}
            style={{
              flex: 1,
              height: '46px',
              padding: '0 18px',
              borderRadius: 'var(--radius-pill)',
              border: '1.5px solid var(--border-subtle)',
              outline: 'none',
              fontSize: '0.9rem'
            }}
          />
          <button
            type="submit"
            disabled={loading || !input.trim()}
            className="btn-primary-pill"
            style={{ padding: '0 20px', height: '46px' }}
          >
            <Send size={16} />
            <span>{t('aiAssistant.sendBtn')}</span>
          </button>
        </form>
      </div>
    </div>
  );
};
