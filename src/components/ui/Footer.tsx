export function Footer() {
  return (
    <footer
      className="backdrop-blur-lg border-t"
      style={{
        backgroundColor: "var(--primary-dark)",
        borderColor: "var(--surface-border)",
      }}
    >
      <div className="container mx-auto px-6 py-8">
        <div className="grid md:grid-cols-4 gap-8">
          <div>
            <div className="flex items-center space-x-3 mb-4">
              <div
                className="w-10 h-10 rounded-full flex items-center justify-center"
                style={{ background: "var(--gradient-pink)" }}
              >
                <span className="text-white text-sm font-bold">SC</span>
              </div>
              <h3
                className="text-xl font-bold tracking-tight font-mono"
                style={{ color: "var(--text-primary)" }}
              >
                StepCoin
              </h3>
            </div>
            <p className="text-sm" style={{ color: "var(--text-secondary)" }}>
              Turn your fitness activities into cryptocurrency with
              privacy-preserving proofs.
            </p>
          </div>

          <div>
            <h4
              className="font-bold mb-3"
              style={{ color: "var(--text-primary)" }}
            >
              Technology
            </h4>
            <ul className="space-y-2 text-sm">
              <li>
                <a
                  href="#"
                  className="transition-colors"
                  style={{ color: "var(--text-secondary)" }}
                  onMouseEnter={(e) =>
                    (e.currentTarget.style.color = "var(--text-primary)")
                  }
                  onMouseLeave={(e) =>
                    (e.currentTarget.style.color = "var(--text-secondary)")
                  }
                >
                  Reclaim Protocol
                </a>
              </li>
              <li>
                <a
                  href="#"
                  className="transition-colors"
                  style={{ color: "var(--text-secondary)" }}
                  onMouseEnter={(e) =>
                    (e.currentTarget.style.color = "var(--text-primary)")
                  }
                  onMouseLeave={(e) =>
                    (e.currentTarget.style.color = "var(--text-secondary)")
                  }
                >
                  1MB.io DataCoins
                </a>
              </li>
              <li>
                <a
                  href="#"
                  className="text-gray-400 hover:text-white transition-colors"
                >
                  Lighthouse Storage
                </a>
              </li>
              <li>
                <a
                  href="#"
                  className="text-gray-400 hover:text-white transition-colors"
                >
                  Zero-Knowledge Proofs
                </a>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="text-white font-bold mb-3">Supported Apps</h4>
            <ul className="space-y-2 text-sm">
              <li>
                <span className="text-gray-400">📱 Google Fit</span>
              </li>
              <li>
                <span className="text-gray-400">🏃‍♀️ Strava</span>
              </li>
              <li>
                <span className="text-gray-400">❤️ Apple Health</span>
              </li>
              <li>
                <span className="text-gray-400">⌚ Fitbit</span>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="text-white font-bold mb-3">Networks</h4>
            <ul className="space-y-2 text-sm">
              <li>
                <span className="text-gray-400">⚡ Base</span>
              </li>
              <li>
                <span className="text-gray-400">🟣 Polygon</span>
              </li>
              <li>
                <span className="text-gray-400">🧪 Sepolia</span>
              </li>
              <li>
                <span className="text-gray-400">📈 Ethereum</span>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-white/10 mt-8 pt-6 flex flex-col md:flex-row justify-between items-center">
          <p className="text-gray-400 text-sm">
            © 2025 StepCoin. Built for the Consumer DataCoin Hackathon.
          </p>
          <div className="flex space-x-4 mt-4 md:mt-0">
            <span className="text-gray-400 text-sm">Privacy First 🔐</span>
            <span className="text-gray-400 text-sm">Open Source 🌟</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
