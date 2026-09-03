"use client";

import { useEffect, useState, useRef } from "react";

export default function LandingPage() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [countersStarted, setCountersStarted] = useState(false);
  const statsRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Intersection observer for stats counting
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting && !countersStarted) {
            setCountersStarted(true);
            startCounters();
          }
        });
      },
      { threshold: 0.25 }
    );

    if (statsRef.current) {
      observer.observe(statsRef.current);
    }

    return () => observer.disconnect();
  }, [countersStarted]);

  const startCounters = () => {
    const stats = [
      { target: 2.3, suffix: 's', decimals: 1, duration: 1500 },
      { target: 94, suffix: '%', decimals: 0, duration: 1580 },
      { target: 24, suffix: '/7', decimals: 0, duration: 1660 },
      { target: 847, suffix: '+', decimals: 0, duration: 1740 }
    ];

    stats.forEach((stat, i) => {
      const element = document.getElementById(`stat-${i}`);
      if (element) {
        const startTime = Date.now() + 480 + i * 90;
        const animate = () => {
          const now = Date.now();
          const elapsed = now - startTime;
          if (elapsed < 0) {
            requestAnimationFrame(animate);
            return;
          }
          const progress = Math.min(elapsed / stat.duration, 1);
          const easeOutCubic = 1 - Math.pow(1 - progress, 3);
          const current = stat.target * easeOutCubic;
          element.textContent = current.toFixed(stat.decimals) + stat.suffix;
          if (progress < 1) {
            requestAnimationFrame(animate);
          }
        };
        requestAnimationFrame(animate);
      }
    });
  };

  return (
    <div className="page" style={{
      backgroundColor: '#000000',
      color: '#ffffff',
      fontFamily: '"Inter", "Segoe UI", system-ui, sans-serif',
      overflow: 'hidden',
      height: '100dvh'
    }}>
      {/* Background Video */}
      <div className="bg" style={{
        position: 'absolute',
        inset: 0,
        overflow: 'hidden',
        backgroundColor: '#000000'
      }}>
        <video 
          className="bg-video"
          autoPlay 
          muted 
          loop 
          playsInline
          style={{
            position: 'absolute',
            inset: 0,
            objectFit: 'cover',
            pointerEvents: 'none',
            zIndex: 0
          }}
        >
          <source
            src="https://d8j0ntlcm91z4.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/hf_20260809_012548_ef22562c-c0ae-4816-ad9d-f8922af4e6a7.mp4"
            type="video/mp4"
          />
        </video>
      </div>

      {/* Mobile Menu Overlay */}
      {menuOpen && (
        <>
          <div 
            className="overlay"
            onClick={() => setMenuOpen(false)}
            style={{
              position: 'fixed',
              inset: 0,
              backgroundColor: 'rgba(0,0,0,0.62)',
              backdropFilter: 'blur(6px)',
              zIndex: 40
            }}
          />
          <div 
            className="mobile-menu"
            style={{
              position: 'fixed',
              top: '80px',
              left: '50%',
              transform: 'translateX(-50%)',
              backgroundColor: 'rgba(255,255,255,0.95)',
              borderRadius: '28px',
              padding: '22px 18px 20px',
              boxShadow: '0 20px 60px rgba(0,0,0,0.45)',
              zIndex: 50,
              width: '90%',
              maxWidth: '320px',
              backdropFilter: 'blur(20px)'
            }}
          >
            {['Home', 'Product', 'Case Studies', 'Contact'].map((item, i) => (
              <a 
                key={item}
                href="#"
                className="mobile-link"
                style={{
                  display: 'block',
                  padding: '14px 16px',
                  color: '#0a0a0a',
                  textDecoration: 'none',
                  fontSize: '16px',
                  fontWeight: 600,
                  borderRadius: '12px',
                  transition: 'background 0.2s'
                }}
                onClick={() => setMenuOpen(false)}
              >
                {item}
              </a>
            ))}
            <button 
              className="mobile-signin"
              style={{
                width: '100%',
                padding: '14px 16px',
                marginTop: '8px',
                backgroundColor: 'rgba(255,255,255,0.9)',
                color: '#0a0a0a',
                border: 'none',
                borderRadius: '12px',
                fontSize: '16px',
                fontWeight: 600,
                cursor: 'pointer',
                transition: 'all 0.2s'
              }}
              onClick={() => window.location.assign('/signin')}
            >
              Sign in
            </button>
          </div>
        </>
      )}

      {/* Main Content */}
      <div style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 'clamp(16px, 2.4vh, 28px) clamp(14px, 3vw, 32px)',
        height: '100dvh',
        position: 'relative',
        zIndex: 1
      }}>
        {/* Header */}
        <header 
          className="header"
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 'clamp(18px, 2.8vw, 28px)' as any,
            maxWidth: '720px',
            width: '100%',
            marginBottom: 'auto'
          } as React.CSSProperties}
        >
          {/* Logo */}
          <button 
            className="logo-btn"
            style={{
              width: 'clamp(40px, 4.4vw, 46px)',
              height: 'clamp(40px, 4.4vw, 46px)',
              borderRadius: '50%',
              backgroundColor: 'rgba(255,255,255,0.95)',
              border: 'none',
              boxShadow: '0 4px 14px rgba(0, 0, 0, 0.16)',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              transition: 'transform 0.2s',
              backdropFilter: 'blur(10px)'
            }}
            onMouseEnter={(e) => e.currentTarget.style.transform = 'scale(1.04)'}
            onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1)'}
          >
            <div style={{
              width: '72%',
              height: '72%',
              display: 'grid',
              placeItems: 'center'
            }}>
              <span style={{ fontSize: 'clamp(18px, 2.2vw, 24px)', color: '#0a0a0a' }}>◒</span>
            </div>
          </button>

          {/* Desktop Nav */}
          <nav 
            className="nav-pill desktop-nav"
            style={{
              backgroundColor: 'rgba(255,255,255,0.95)',
              height: 'clamp(44px, 5.2vw, 48px)',
              maxWidth: '430px',
              flex: 1,
              padding: '4px 8px',
              borderRadius: '999px',
              boxShadow: '0 4px 14px rgba(0, 0, 0, 0.16)',
              display: 'flex',
              alignItems: 'center',
              gap: '4px' as any,
              backdropFilter: 'blur(10px)'
            }}
          >
            {['Home', 'Product', 'Case Studies', 'Contact'].map((item, i) => (
              <a
                key={item}
                href="#"
                className="nav-link"
                style={{
                  fontFamily: '"Inter", "Segoe UI", system-ui, sans-serif',
                  fontWeight: 600,
                  fontSize: 'clamp(13px, 1.4vw, 15px)',
                  letterSpacing: '-0.01em',
                  color: '#0a0a0a',
                  textDecoration: 'none',
                  padding: '8px 16px',
                  borderRadius: '999px',
                  opacity: i === 0 ? 1 : 0.85,
                  transition: 'all 0.2s',
                  position: 'relative',
                  backgroundColor: i === 0 ? 'rgba(255,255,255,0.95)' : 'rgba(255,255,255,0.8)',
                  textShadow: '0 1px 2px rgba(0,0,0,0.1)'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.opacity = i === 0 ? '1' : '0.85';
                  if (i === 0) {
                    e.currentTarget.style.backgroundColor = 'rgba(255,255,255,1)';
                  }
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.opacity = i === 0 ? '1' : '0.7';
                  if (i === 0) {
                    e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.95)';
                  }
                }}
              >
                {item}
                {i === 0 && (
                  <span style={{
                    position: 'absolute',
                    bottom: '5px',
                    left: '50%',
                    transform: 'translateX(-50%)',
                    display: 'flex',
                    alignItems: 'center'
                  }}>
                    <span style={{
                      width: '3px',
                      height: '3px',
                      backgroundColor: '#000',
                      borderRadius: '50%',
                      marginRight: '2px'
                    }} />
                    <span style={{
                      width: '3px',
                      height: '3px',
                      backgroundColor: '#000',
                      borderRadius: '50%',
                      marginRight: '2px'
                    }} />
                    <span style={{
                      width: '3px',
                      height: '3px',
                      backgroundColor: '#000',
                      borderRadius: '50%'
                    }} />
                  </span>
                )}
              </a>
            ))}
          </nav>

          {/* Sign In Button */}
          <button 
            className="sign-in desktop-signin"
            style={{
              backgroundColor: 'rgba(255,255,255,0.9)',
              color: '#0a0a0a',
              height: 'clamp(44px, 5.2vw, 48px)',
              padding: '0 20px',
              borderRadius: '999px',
              border: 'none',
              fontFamily: '"Inter", "Segoe UI", system-ui, sans-serif',
              fontWeight: 600,
              fontSize: 'clamp(13px, 1.4vw, 15px)',
              cursor: 'pointer',
              boxShadow: '0 4px 14px rgba(0, 0, 0, 0.16)',
              transition: 'all 0.2s'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = '#ffffff';
              e.currentTarget.style.color = '#000000';
              e.currentTarget.style.transform = 'translateY(-1px)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.9)';
              e.currentTarget.style.color = '#0a0a0a';
              e.currentTarget.style.transform = 'translateY(0)';
            }}
            onClick={() => window.location.assign('/signin')}
          >
            Sign in
          </button>

          {/* Mobile Burger */}
          <button 
            className="mobile-burger"
            style={{
              display: 'none',
              width: '48px',
              height: '48px',
              borderRadius: '50%',
              backgroundColor: '#28282a',
              border: 'none',
              cursor: 'pointer',
              position: 'relative'
            }}
            onClick={() => setMenuOpen(!menuOpen)}
          >
            <span style={{
              position: 'absolute',
              width: '18px',
              height: '1.5px',
              backgroundColor: '#fff',
              top: '50%',
              left: '50%',
              transform: 'translate(-50%, -6px)',
              transition: 'all 0.2s'
            }} />
            <span style={{
              position: 'absolute',
              width: '18px',
              height: '1.5px',
              backgroundColor: '#fff',
              top: '50%',
              left: '50%',
              transform: 'translate(-50%, 0)',
              transition: 'all 0.2s'
            }} />
            <span style={{
              position: 'absolute',
              width: '18px',
              height: '1.5px',
              backgroundColor: '#fff',
              top: '50%',
              left: '50%',
              transform: 'translate(-50%, 6px)',
              transition: 'all 0.2s'
            }} />
          </button>
        </header>

        {/* Hero */}
        <div 
          className="hero"
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            textAlign: 'center',
            maxWidth: '900px',
            flex: 1,
            justifyContent: 'center'
          }}
        >
          {/* Trust Row */}
          <div 
            className="trust-row"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              marginBottom: 'clamp(16px, 2.5vh, 26px)',
              '--trust-size': 'clamp(36px, 4.5vw, 42px)'
            } as React.CSSProperties}
          >
            {/* Avatar Rings */}
            {['microsoft', 'amazon', 'google'].map((brand, i) => (
              <div
                key={brand}
                className="avatar-ring"
                style={{
                  width: 'var(--trust-size)',
                  height: 'var(--trust-size)',
                  backgroundColor: 'rgba(40, 40, 40, 0.8)',
                  border: '2px solid rgba(255,255,255,0.6)',
                  borderRadius: '50%',
                  padding: '5px',
                  marginLeft: i > 0 ? 'calc(var(--trust-size) * -0.42)' : 0,
                  zIndex: i + 1,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  transition: 'transform 0.35s',
                  boxShadow: '0 0 20px rgba(100,100,255,0.3)'
                }}
                onMouseEnter={(e) => {
                  const offsets = [-2, -4, -2];
                  e.currentTarget.style.transform = `translateY(${offsets[i]}px)`;
                  e.currentTarget.style.boxShadow = '0 0 30px rgba(100,100,255,0.5)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = 'translateY(0)';
                  e.currentTarget.style.boxShadow = '0 0 20px rgba(100,100,255,0.3)';
                }}
              >
                <div style={{
                  width: '100%',
                  height: '100%',
                  backgroundColor: '#fff',
                  borderRadius: '50%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}>
                  <i 
                    className={`fa-brands fa-${brand}`}
                    style={{
                      color: '#111',
                      fontSize: 'calc(var(--trust-size) * 0.34)'
                    }}
                  />
                </div>
              </div>
            ))}

            {/* Trust Pill */}
            <div
              className="trust-pill"
              style={{
                height: 'var(--trust-size)',
                backgroundColor: 'rgba(40, 40, 40, 0.9)',
                border: '2px solid rgba(255,255,255,0.6)',
                borderRadius: '999px',
                marginLeft: 'calc(var(--trust-size) * -0.42)',
                paddingLeft: 'calc(var(--trust-size) * 0.58)',
                paddingRight: '16px',
                display: 'flex',
                alignItems: 'center',
                zIndex: 4,
                boxShadow: '0 0 20px rgba(100,100,255,0.3)'
              }}
            >
              <span style={{
                fontFamily: '"Inter", "Segoe UI", system-ui, sans-serif',
                fontWeight: 700,
                color: '#ffffff',
                fontSize: 'clamp(12px, 1.4vw, 13.5px)',
                whiteSpace: 'nowrap',
                textShadow: '0 2px 8px rgba(0,0,0,0.8), 0 0 16px rgba(100,100,255,0.4)'
              }}>
                Trusted by 2000+ Enterprises
              </span>
            </div>
          </div>

          {/* Headline */}
          <div 
            className="headline"
            style={{
              fontFamily: '"BubbledotICG-FinePos", "Geist Pixel Circle", monospace',
              fontSize: 'clamp(28px, 6.2vw, 80px)',
              letterSpacing: '-0.04em',
              lineHeight: 1.12,
              color: '#ffffff',
              whiteSpace: 'nowrap',
              overflow: 'hidden',
              textShadow: '0 0 40px rgba(255,255,255,0.8), 0 0 80px rgba(100,100,255,0.5), 0 0 120px rgba(255,100,100,0.3)'
            } as React.CSSProperties}
          >
            <span 
              className="headline-line"
              style={{
                display: 'block',
                opacity: 1,
                transform: 'translateY(0)',
                color: '#090909',
              }}
            >
              AI Data Agent
            </span>
          </div>

          {/* Subhead */}
          <p 
            className="subhead"
            style={{
              maxWidth: 'min(500px, 92%)',
              fontSize: 'clamp(calc(13.5px + 2pt), calc(1.55vw + 2pt), calc(16.5px + 2pt))',
              color: '#090909',
              opacity: 0.95,
              lineHeight: 1.55,
              fontWeight: 400,
              marginTop: 'clamp(16px, 2vh, 24px)',
              marginBottom: 'clamp(20px, 2.5vh, 32px)',
              // textShadow: '0 2px 12px rgba(0,0,0,0.9), 0 0 24px rgba(100,100,255,0.3)'
            } as React.CSSProperties}
          >
            AI Data Agent understands your business data, investigates what's happening, 
            and turns complex analysis into clear business intelligence.
          </p>

          {/* CTA */}
          <button 
            className="cta"
            style={{
              backgroundColor: '#ffffff',
              color: '#000000',
              fontFamily: '"Inter", "Segoe UI", system-ui, sans-serif',
              fontWeight: 700,
              fontSize: 'clamp(13.5px, 1.5vw, 14.5px)',
              padding: 'clamp(11px, 1.6vh, 13px) clamp(22px, 3vw, 28px)',
              borderRadius: '999px',
              border: 'none',
              cursor: 'pointer',
              boxShadow: '0 0 0 1px rgba(255,255,255,0.2), 0 0 30px rgba(255,255,255,0.4), 0 0 60px rgba(100,100,255,0.2), 0 0 90px rgba(255,100,100,0.1)',
              transition: 'all 0.3s'
            } as React.CSSProperties}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = 'translateY(-3px) scale(1.05)';
              e.currentTarget.style.boxShadow = '0 0 0 1px rgba(255,255,255,0.3), 0 0 40px rgba(255,255,255,0.6), 0 0 80px rgba(100,100,255,0.3), 0 0 120px rgba(255,100,100,0.15)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'translateY(0) scale(1)';
              e.currentTarget.style.boxShadow = '0 0 0 1px rgba(255,255,255,0.2), 0 0 30px rgba(255,255,255,0.4), 0 0 60px rgba(100,100,255,0.2), 0 0 90px rgba(255,100,100,0.1)';
            }}
            onClick={() => window.location.assign('/signup')}
          >
            Get Started
          </button>
        </div>

        {/* Stats Footer */}
        <div 
          ref={statsRef}
          className="stats-footer"
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(4, 1fr)',
            maxWidth: '920px',
            width: '100%',
            gap: 'clamp(16px, 2vw, 24px)' as any,
            marginTop: 'auto',
            padding: 'clamp(20px, 3vw, 32px)',
            backgroundColor: 'rgba(20, 20, 30, 0.7)',
            borderRadius: 'clamp(16px, 2vw, 24px)',
            border: '1px solid rgba(255,255,255,0.15)',
            backdropFilter: 'blur(20px)',
            boxShadow: '0 10px 40px rgba(0,0,0,0.4), 0 0 60px rgba(100,100,255,0.15)'
          } as React.CSSProperties}
        >
          {[
            { icon: '<', target: 2.3, suffix: 's', decimals: 1, label: 'Avg Investigation Time' },
            { icon: '%', target: 94, suffix: '%', decimals: 0, label: 'Accuracy Rate' },
            { icon: '*', target: 24, suffix: '/7', decimals: 0, label: 'Autonomous Monitoring' },
            { icon: '#', target: 847, suffix: '+', decimals: 0, label: 'Data Points Analyzed' }
          ].map((stat, i) => (
            <div 
              key={i}
              className="stat-item"
              style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                textAlign: 'center',
                opacity: 1,
                transform: 'translateY(0) scale(1)',
                filter: 'blur(0)',
                transition: 'all 0.3s',
                cursor: 'default'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'translateY(-8px) scale(1.05)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'translateY(0) scale(1)';
              }}
            >
              <span 
                className="stat-icon"
                style={{
                  fontFamily: '"BubbledotICG-FinePos", "Geist Pixel Circle", monospace',
                  fontSize: 'clamp(22px, 3vw, 33px)',
                  color: '#ffffff',
                  marginBottom: '4px',
                  textShadow: '0 2px 10px rgba(0,0,0,0.8), 0 0 30px rgba(100,100,255,0.6)'
                }}
              >
                {stat.icon}
              </span>
              <span 
                id={`stat-${i}`}
                className="stat-value"
                style={{
                  fontFamily: '"Inter", "Segoe UI", system-ui, sans-serif',
                  color: '#ffffff',
                  fontSize: 'clamp(18px, 2.2vw, 26px)',
                  letterSpacing: '-0.025em',
                  fontVariantNumeric: 'tabular-nums',
                  marginBottom: '2px',
                  textShadow: '0 2px 8px rgba(0,0,0,0.8), 0 0 20px rgba(100,100,255,0.5)',
                  fontWeight: 600
                }}
              >
                0{stat.suffix}
              </span>
              <span 
                className="stat-label"
                style={{
                  color: '#e8e6e7',
                  fontSize: 'clamp(11px, 1.2vw, 12.5px)',
                  textShadow: '0 2px 6px rgba(0,0,0,0.8), 0 0 12px rgba(100,100,255,0.3)',
                  fontWeight: 500
                }}
              >
                {stat.label}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Fonts and Styles */}
      <link
        href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600&display=swap"
        rel="stylesheet"
      />
      <link
        href="https://db.onlinewebfonts.com/c/8cb707a9b8a73f8a7403336b861c3074?family=BubbledotICG-FinePos"
        rel="stylesheet"
      />
      <link
        rel="stylesheet"
        href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.2/css/all.min.css"
        integrity="sha512-SnH5WK+bZxgPHs44uWIX+LLJAJ9/2PkPKZ5QiAj6Ta86w+fsb2TkcmfRyVX3pBnMFcV7oQPJkl9QevSCWr3W6A=="
        crossOrigin="anonymous"
      />

      <style jsx global>{`
        @font-face {
          font-family: 'Geist Pixel Circle';
          src: url('/fonts/GeistPixel-Circle.woff2') format('woff2');
          font-weight: 400;
          font-display: swap;
        }

        @keyframes slideDown {
          from {
            opacity: 0;
            transform: translateY(-18px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }











        @media (max-width: 720px) {
          .desktop-nav, .desktop-signin {
            display: none !important;
          }

          .mobile-burger {
            display: block !important;
          }

          .stats-footer {
            grid-template-columns: repeat(2, 1fr);
            padding: clamp(16px, 3vw, 24px);
            border-radius: clamp(12px, 2vw, 16px);
          }

          .headline {
            letter-spacing: -0.08em;
            line-height: 1.05;
          }

          @media (max-width: 420px) {
            .headline {
              letter-spacing: -0.09em;
              line-height: 1.04;
            }
          }
        }



        .mobile-link:hover {
          background: #f5f5f5;
        }

        .mobile-signin:hover {
          background: #323234;
          color: #fff;
        }

        body.menu-open {
          overflow: hidden;
        }
      `}</style>
    </div>
  );
}