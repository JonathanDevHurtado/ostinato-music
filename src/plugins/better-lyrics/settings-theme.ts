const WINDOW_CHROME_CSS = String.raw`
                  :root, html {
                    background: transparent !important;
                    background-color: transparent !important;
                    width: 100% !important;
                    min-width: 100% !important;
                    max-width: 100% !important;
                    overflow: hidden !important;
                  }
                  
                  body {
                    background: transparent !important;
                    margin: 0 !important;
                    padding: 0 !important;
                    overflow: hidden !important;
                    height: 100vh !important;
                  }

                  #glassy-wrapper {
                    position: fixed;
                    inset: 0;
                    background: radial-gradient(circle at top left, rgba(30, 30, 40, 0.85), rgba(15, 15, 18, 0.95));
                    backdrop-filter: blur(40px) saturate(180%);
                    -webkit-backdrop-filter: blur(40px) saturate(180%);
                    border-radius: 16px;
                    border: 1px solid rgba(255, 255, 255, 0.12);
                    overflow: hidden;
                    display: flex;
                    flex-direction: column;
                    box-shadow: 0 25px 60px rgba(0, 0, 0, 0.55), inset 0 1px 0 rgba(255, 255, 255, 0.15);
                    clip-path: inset(0 round 16px);
                    -webkit-app-region: no-drag;
                    z-index: 1;
                    animation: glassyAppear 0.65s cubic-bezier(0.22, 1, 0.36, 1) forwards;
                  }

                  #glassy-wrapper.closing {
                    animation: glassyDisappear 0.4s cubic-bezier(0.32, 0, 0.67, 0) forwards !important;
                    pointer-events: none;
                  }

                  #glassy-wrapper::before {
                    content: "";
                    position: absolute;
                    top: -15%;
                    left: -15%;
                    width: 70%;
                    height: 70%;
                    background: radial-gradient(circle, rgba(123, 97, 255, 0.18) 0%, rgba(123, 97, 255, 0) 70%);
                    z-index: -1;
                    pointer-events: none;
                    -webkit-app-region: no-drag !important;
                    filter: blur(40px);
                  }

                  #glassy-wrapper::after {
                    content: "";
                    position: absolute;
                    bottom: -15%;
                    right: -15%;
                    width: 70%;
                    height: 70%;
                    background: radial-gradient(circle, rgba(0, 242, 254, 0.12) 0%, rgba(0, 242, 254, 0) 70%);
                    z-index: -1;
                    pointer-events: none;
                    -webkit-app-region: no-drag !important;
                    filter: blur(40px);
                  }

                  @keyframes glassyGlowPulse {
                    0% {
                      opacity: 0.7;
                      transform: scale(0.95) translate(0, 0);
                    }
                    100% {
                      opacity: 1;
                      transform: scale(1.05) translate(5%, 5%);
                    }
                  }

                  @keyframes glassyAppear {
                    0% {
                      opacity: 0;
                      transform: scale(0.85) translateY(40px);
                      filter: blur(15px);
                    }
                    100% {
                      opacity: 1;
                      transform: scale(1) translateY(0);
                      filter: blur(0px);
                    }
                  }

                  @keyframes glassyDisappear {
                    0% {
                      opacity: 1;
                      transform: scale(1) translateY(0);
                      filter: blur(0px);
                    }
                    40% { opacity: 0.8; }
                    100% {
                      opacity: 0;
                      transform: scale(0.9) translateY(25px);
                      filter: blur(12px);
                    }
                  }

                  /* Ensure the original nav doesn't capture drag */
                  nav, nav * {
                    -webkit-app-region: no-drag !important;
                  }

                  #glassy-titlebar {
                    height: 42px;
                    min-height: 42px;
                    display: flex;
                    align-items: center;
                    justify-content: space-between;
                    padding: 0 16px;
                    -webkit-app-region: drag !important;
                    user-select: none;
                    z-index: 10002 !important;
                    position: relative;
                  }

                  #glassy-titlebar-label {
                    font-family: 'Segoe UI', sans-serif;
                    font-size: 13px;
                    font-weight: 600;
                    color: rgba(255,255,255,0.85);
                    letter-spacing: 0.3px;
                  }

                  #glassy-close-btn {
                    -webkit-app-region: no-drag !important;
                    width: 30px;
                    height: 30px;
                    background: rgba(255, 255, 255, 0.1);
                    border-radius: 50%;
                    display: flex;
                    justify-content: center;
                    align-items: center;
                    cursor: pointer;
                    transition: all 0.3s;
                    border: 1px solid rgba(255, 255, 255, 0.2);
                    backdrop-filter: blur(10px);
                  }

                  #glassy-close-btn:hover {
                    background: rgba(255, 80, 80, 0.8);
                    transform: scale(1.1);
                  }

                  #glassy-close-btn svg {
                    width: 13px;
                    height: 13px;
                    fill: #fff;
                  }

`;

const NEW_OPTIONS_CSS = String.raw`
                  /* --- New options page (bl-dev) ---
                     Theme the extension's design tokens instead of its markup, so
                     upstream component changes do not need matching overrides here. */

                  /* The page portals modals, menus, toasts and tooltips to <body>.
                     Keep the window frame below them instead of at 999999. */
                  #glassy-wrapper {
                    z-index: 1;
                    --accent: #23d5ab;
                    --switch-on: #23a6d5;
                    --switch-mid: rgba(35, 166, 213, 0.45);
                    --card-bg: rgba(255, 255, 255, 0.055);
                    --card-surface: rgba(30, 31, 34, 0.94);
                    --menu-bg: #1e1f22;
                    --toast-bg: #1e1f22;
                    --field-bg: rgba(0, 0, 0, 0.22);
                    --pane-bg: rgba(0, 0, 0, 0.18);
                  }

                  * {
                    box-sizing: border-box;
                  }

                  ::-webkit-scrollbar {
                    width: 8px;
                    height: 8px;
                  }
                  ::-webkit-scrollbar-track {
                    background: rgba(0, 0, 0, 0.1);
                    border-radius: 4px;
                  }
                  ::-webkit-scrollbar-thumb {
                    background: rgba(255, 255, 255, 0.2);
                    border-radius: 4px;
                  }
                  ::-webkit-scrollbar-thumb:hover {
                    background: rgba(255, 255, 255, 0.4);
                  }

                  body, html {
                    font-family: 'Satoshi', 'Inter', -apple-system, BlinkMacSystemFont, sans-serif !important;
                    color: rgba(255, 255, 255, 0.9) !important;
                  }

                  body.options-page {
                    background: transparent !important;
                  }

                  /* Keep the page's own flex layout; only the host adds a titlebar. */
                  #glassy-content {
                    flex: 1;
                    min-height: 0;
                    display: flex;
                    flex-direction: column;
                    padding: 0 !important;
                    overflow: hidden !important;
                    -webkit-app-region: no-drag !important;
                    background: rgba(20, 20, 25, 0.35) !important;
                    border-top: 1px solid rgba(255, 255, 255, 0.08);
                  }

                  #glassy-content > .head-slot,
                  #glassy-content > .pop__foot {
                    flex: none;
                  }

                  #glassy-content > #options {
                    flex: 1;
                    min-height: 0;
                  }

                  #navbar {
                    background: transparent !important;
                    border-bottom: 1px solid rgba(255, 255, 255, 0.1) !important;
                    padding: 0 0 1rem 0 !important;
                    margin-bottom: 1.5rem !important;
                    display: flex !important;
                    justify-content: space-between !important;
                    align-items: center !important;
                  }

                  #navbar h1 {
                    font-size: 1.2rem !important;
                    font-weight: 700 !important;
                    text-shadow: 0 2px 10px rgba(0, 0, 0, 0.2) !important;
                    margin: 0 !important;
                  }

                  #navbar h1 img {
                    border-radius: 20%;
                    box-shadow: 0 4px 10px rgba(0, 0, 0, 0.3);
                  }

                  .heading {
                    display: flex;
                    align-items: baseline;
                    gap: 8px;
                  }

                  .heading span {
                    font-size: 0.7rem !important;
                    background: rgba(255, 255, 255, 0.1);
                    padding: 2px 6px;
                    border-radius: 8px;
                    color: #23d5ab;
                  }

`;

const LEGACY_OPTIONS_CSS = String.raw`
                  #glassy-content {
                    flex: 1;
                    overflow: auto;
                    -webkit-app-region: no-drag !important;
                    border-radius: 0 0 16px 16px;
                    padding: 1.25rem 2rem 1rem !important; /* Restore original body padding */
                    box-sizing: border-box;
                    background: rgba(20, 20, 25, 0.5); /* Dark glass layer for readability */
                    border-top: 1px solid rgba(255,255,255,0.08);
                  }

                  /* --- Modern Glassmorphism Overrides --- */
                  
                  * {
                    box-sizing: border-box;
                  }

                  ::-webkit-scrollbar {
                    width: 8px;
                    height: 8px;
                  }
                  ::-webkit-scrollbar-track {
                    background: rgba(0, 0, 0, 0.1);
                    border-radius: 4px;
                  }
                  ::-webkit-scrollbar-thumb {
                    background: rgba(255, 255, 255, 0.2);
                    border-radius: 4px;
                  }
                  ::-webkit-scrollbar-thumb:hover {
                    background: rgba(255, 255, 255, 0.4);
                  }

                  body, html {
                    font-family: 'Satoshi', 'Inter', -apple-system, BlinkMacSystemFont, sans-serif !important;
                    color: rgba(255, 255, 255, 0.9) !important;
                  }

                  #navbar {
                    background: transparent !important;
                    border-bottom: 1px solid rgba(255, 255, 255, 0.1) !important;
                    padding: 0 0 1rem 0 !important;
                    margin-bottom: 1.5rem !important;
                    display: flex !important;
                    justify-content: space-between !important;
                    align-items: center !important;
                  }

                  #navbar h1 {
                    font-size: 1.2rem !important;
                    font-weight: 700 !important;
                    text-shadow: 0 2px 10px rgba(0,0,0,0.2) !important;
                    display: flex !important;
                    align-items: center !important;
                    gap: 10px !important;
                    margin: 0 !important;
                  }
                  
                  #navbar h1 img {
                    border-radius: 20%;
                    box-shadow: 0 4px 10px rgba(0,0,0,0.3);
                  }

                  .heading {
                    display: flex;
                    align-items: baseline;
                    gap: 8px;
                  }

                  .heading span {
                    font-size: 0.7rem !important;
                    background: rgba(255,255,255,0.1);
                    padding: 2px 6px;
                    border-radius: 8px;
                    color: #23d5ab;
                  }

                  /* Tabs */
                  .tab-scroll-wrapper {
                    background: transparent !important;
                    border: none !important;
                    box-shadow: none !important;
                    margin-bottom: 2rem !important;
                    position: relative !important;
                    display: flex !important;
                    align-items: center !important;
                    border-radius: 16px !important;
                  }

                  .tab-container {
                    display: flex !important;
                    gap: 0.5rem !important;
                    background: rgba(0, 0, 0, 0.2) !important;
                    padding: 0.5rem !important;
                    border-radius: 16px !important;
                    border: 1px solid rgba(255, 255, 255, 0.05) !important;
                    overflow-x: auto !important;
                    scroll-behavior: smooth !important;
                    flex: 1 !important;
                    margin-bottom: 0 !important;
                  }

                  .tab-container::-webkit-scrollbar {
                    display: none !important;
                  }

                  .tab-arrow {
                    background: rgba(255,255,255,0.1) !important;
                    border: 1px solid rgba(255,255,255,0.1) !important;
                    color: #fff !important;
                    border-radius: 50% !important;
                    width: 32px !important;
                    height: 32px !important;
                    display: flex !important;
                    align-items: center !important;
                    justify-content: center !important;
                    cursor: pointer !important;
                    flex-shrink: 0 !important;
                    backdrop-filter: blur(5px) !important;
                    transition: all 0.2s !important;
                    z-index: 10 !important;
                  }

                  .tab-arrow:hover {
                    background: rgba(255,255,255,0.2) !important;
                  }

                  .tab-arrow-left {
                    margin-right: 0.5rem !important;
                  }

                  .tab-arrow-right {
                    margin-left: 0.5rem !important;
                  }

                  .tab {
                    background: transparent !important;
                    border: none !important;
                    color: rgba(255, 255, 255, 0.6) !important;
                    padding: 0.6rem 1rem !important;
                    border-radius: 12px !important;
                    font-weight: 600 !important;
                    font-size: 0.9rem !important;
                    cursor: pointer !important;
                    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1) !important;
                    white-space: nowrap;
                  }

                  .tab:hover {
                    background: rgba(255, 255, 255, 0.05) !important;
                    color: rgba(255, 255, 255, 0.9) !important;
                  }

                  .tab.active {
                    background: rgba(255, 255, 255, 0.15) !important;
                    color: #fff !important;
                    box-shadow: 0 4px 15px rgba(0, 0, 0, 0.1) !important;
                    border: 1px solid rgba(255, 255, 255, 0.1) !important;
                  }

                  /* Settings Groups & Containers */
                  .settings-group {
                    background: rgba(255, 255, 255, 0.03) !important;
                    border: 1px solid rgba(255, 255, 255, 0.08) !important;
                    border-radius: 20px !important;
                    padding: 1.5rem !important;
                    margin-bottom: 1.5rem !important;
                    box-shadow: 0 10px 30px rgba(0, 0, 0, 0.1) !important;
                    backdrop-filter: blur(10px) !important;
                  }

                  .settings-group h2 {
                    display: flex !important;
                    align-items: center !important;
                    gap: 0.75rem !important;
                    font-size: 1.15rem !important;
                    margin-top: 0 !important;
                    margin-bottom: 0.5rem !important;
                    color: #fff !important;
                  }

                  .settings-group h2 svg {
                    width: 20px !important;
                    height: 20px !important;
                    color: #23a6d5 !important;
                    filter: drop-shadow(0 0 8px rgba(35, 166, 213, 0.5));
                  }

                  .settings-group > p {
                    color: rgba(255, 255, 255, 0.6) !important;
                    margin-bottom: 1.5rem !important;
                    line-height: 1.5 !important;
                    font-size: 0.9rem !important;
                  }

                  .container {
                    display: flex !important;
                    justify-content: space-between !important;
                    align-items: center !important;
                    background: rgba(0, 0, 0, 0.2) !important;
                    padding: 1rem 1.2rem !important;
                    border-radius: 14px !important;
                    margin-bottom: 0.75rem !important;
                    border: 1px solid rgba(255, 255, 255, 0.03) !important;
                    transition: all 0.3s ease !important;
                  }

                  .container:hover {
                    background: rgba(255, 255, 255, 0.06) !important;
                    border-color: rgba(255, 255, 255, 0.1) !important;
                    transform: translateY(-1px) !important;
                  }

                  .container[style*="display: none"] {
                    display: none !important;
                  }

                  .container > span {
                    font-weight: 500 !important;
                    font-size: 0.95rem !important;
                  }

                  /* Checkbox Toggle Switch Style */
                  .container > label {
                    position: relative !important;
                    display: inline-block !important;
                    width: 44px !important;
                    height: 24px !important;
                    margin: 0 !important;
                  }

                  .container > label input {
                    opacity: 0 !important;
                    width: 0 !important;
                    height: 0 !important;
                  }

                  .container .checkmark {
                    position: absolute !important;
                    cursor: pointer !important;
                    top: 0 !important;
                    left: 0 !important;
                    right: 0 !important;
                    bottom: 0 !important;
                    background-color: rgba(255, 255, 255, 0.1) !important;
                    transition: .4s !important;
                    border-radius: 34px !important;
                    border: 1px solid rgba(255, 255, 255, 0.2) !important;
                  }

                  .container .checkmark:before {
                    position: absolute !important;
                    content: "" !important;
                    height: 16px !important;
                    width: 16px !important;
                    left: 3px !important;
                    bottom: 3px !important;
                    background-color: #fff !important;
                    transition: .4s cubic-bezier(0.68, -0.55, 0.265, 1.55) !important;
                    border-radius: 50% !important;
                    box-shadow: 0 2px 5px rgba(0,0,0,0.3) !important;
                  }

                  .container input:checked + .checkmark {
                    background-color: #23a6d5 !important;
                    border-color: #23d5ab !important;
                    box-shadow: 0 0 12px rgba(35, 166, 213, 0.4) !important;
                  }

                  .container input:checked + .checkmark:before {
                    transform: translateX(20px) !important;
                  }

                  /* Fix for .checkbox-container in Sortable List */
                  .checkbox-container {
                    width: 44px !important;
                    max-width: 44px !important;
                    height: 24px !important;
                    margin: 0 !important;
                  }
                  .checkbox-container .checkmark {
                    border-radius: 34px !important;
                    background-color: rgba(255, 255, 255, 0.1) !important;
                    border: 1px solid rgba(255, 255, 255, 0.2) !important;
                  }
                  .checkbox-container .checkmark:before {
                    width: 16px !important;
                    height: 16px !important;
                    left: 3px !important;
                    bottom: 3px !important;
                    background-color: #fff !important;
                    border-radius: 50% !important;
                    box-shadow: 0 2px 5px rgba(0,0,0,0.3) !important;
                  }
                  .checkbox-container input:checked + .checkmark {
                    background-color: #23a6d5 !important;
                    border-color: #23d5ab !important;
                    box-shadow: 0 0 12px rgba(35, 166, 213, 0.4) !important;
                  }
                  .checkbox-container input:checked + .checkmark:before {
                    transform: translateX(20px) !important;
                  }

                  .provider-name {
                    margin-left: calc(44px + 1rem) !important;
                  }

                  /* Buttons */
                  button:not(.tab) {
                    background: rgba(255, 255, 255, 0.1) !important;
                    border: 1px solid rgba(255, 255, 255, 0.2) !important;
                    color: #fff !important;
                    padding: 0.6rem 1.2rem !important;
                    border-radius: 10px !important;
                    cursor: pointer !important;
                    font-weight: 600 !important;
                    font-size: 0.85rem !important;
                    transition: all 0.3s ease !important;
                    display: inline-flex !important;
                    align-items: center !important;
                    gap: 0.5rem !important;
                    backdrop-filter: blur(5px) !important;
                  }

                  button:not(.tab):hover {
                    background: rgba(255, 255, 255, 0.2) !important;
                    transform: translateY(-2px) !important;
                    box-shadow: 0 5px 15px rgba(0, 0, 0, 0.2) !important;
                  }

                  button:not(.tab):active {
                    transform: translateY(0) !important;
                  }

                  button.btn-danger {
                    background: rgba(231, 60, 126, 0.15) !important;
                    border-color: rgba(231, 60, 126, 0.3) !important;
                    color: #ff8fb3 !important;
                  }

                  button.btn-danger:hover {
                    background: rgba(231, 60, 126, 0.3) !important;
                    box-shadow: 0 5px 15px rgba(231, 60, 126, 0.2) !important;
                  }

                  button svg {
                    width: 16px !important;
                    height: 16px !important;
                  }

                  /* Select */
                  .select {
                    position: relative !important;
                    background: transparent !important;
                    border: none !important;
                    padding: 0 !important;
                  }

                  select {
                    background: rgba(0, 0, 0, 0.3) !important;
                    border: 1px solid rgba(255, 255, 255, 0.1) !important;
                    color: #fff !important;
                    padding: 0.6rem 2rem 0.6rem 1rem !important;
                    border-radius: 10px !important;
                    appearance: none !important;
                    font-family: inherit !important;
                    font-size: 0.9rem !important;
                    cursor: pointer !important;
                    backdrop-filter: blur(5px) !important;
                    transition: all 0.3s ease !important;
                  }

                  select:hover, select:focus {
                    background: rgba(0, 0, 0, 0.5) !important;
                    border-color: rgba(255, 255, 255, 0.3) !important;
                    outline: none !important;
                  }

                  .select::after {
                    content: '▼' !important;
                    background: none !important;
                    position: absolute !important;
                    right: 0.8rem !important;
                    top: 50% !important;
                    transform: translateY(-50%) !important;
                    color: rgba(255, 255, 255, 0.5) !important;
                    pointer-events: none !important;
                    font-size: 0.7rem !important;
                  }

                  select option {
                    background: #1e1f22 !important;
                    color: #fff !important;
                  }

                  /* Modals */
                  .modal-overlay {
                    background: rgba(0, 0, 0, 0.5) !important;
                    backdrop-filter: blur(10px) !important;
                  }

                  .modal {
                    background: rgba(30, 31, 34, 0.85) !important;
                    border: 1px solid rgba(255, 255, 255, 0.15) !important;
                    border-radius: 20px !important;
                    box-shadow: 0 25px 50px rgba(0, 0, 0, 0.5) !important;
                    backdrop-filter: blur(25px) saturate(200%) !important;
                  }

                  .modal-header {
                    border-bottom: 1px solid rgba(255, 255, 255, 0.08) !important;
                  }

                  .modal-footer {
                    border-top: 1px solid rgba(255, 255, 255, 0.08) !important;
                    background: transparent !important;
                  }

                  button.modal-close-btn {
                    background: transparent !important;
                    border: none !important;
                    padding: 0.5rem !important;
                    width: 32px !important;
                    height: 32px !important;
                    display: grid !important;
                    justify-items: center !important;
                    align-items: center !important;
                    box-shadow: none !important;
                  }
                  button.modal-close-btn:hover {
                    background: rgba(255,255,255,0.1) !important;
                    transform: none !important;
                    box-shadow: none !important;
                  }
                  button.modal-close-btn svg {
                    fill: currentColor !important;
                    width: 1.25rem !important;
                    height: 1.25rem !important;
                  }

                  /* Offset Stepper Buttons Fix */
                  .offset-stepper {
                    display: inline-flex !important;
                    align-items: center !important;
                    gap: 0.35rem !important;
                    background: rgba(0, 0, 0, 0.25) !important;
                    padding: 4px 6px !important;
                    border-radius: 12px !important;
                    border: 1px solid rgba(255, 255, 255, 0.05) !important;
                  }

                  button.offset-stepper__btn,
                  .offset-stepper__btn {
                    width: 28px !important;
                    height: 28px !important;
                    min-width: 28px !important;
                    max-width: 28px !important;
                    min-height: 28px !important;
                    max-height: 28px !important;
                    padding: 0 !important;
                    margin: 0 !important;
                    display: inline-flex !important;
                    align-items: center !important;
                    justify-content: center !important;
                    background: rgba(255, 255, 255, 0.08) !important;
                    border: 1px solid rgba(255, 255, 255, 0.12) !important;
                    border-radius: 8px !important;
                    color: rgba(255, 255, 255, 0.9) !important;
                    cursor: pointer !important;
                    box-shadow: none !important;
                    transform: none !important;
                    transition: all 0.2s ease !important;
                  }

                  button.offset-stepper__btn:hover,
                  .offset-stepper__btn:hover {
                    background: rgba(255, 255, 255, 0.2) !important;
                    color: #23d5ab !important;
                    transform: scale(1.08) !important;
                  }

                  .offset-stepper__btn svg {
                    width: 14px !important;
                    height: 14px !important;
                    fill: currentColor !important;
                    display: block !important;
                    pointer-events: none !important;
                  }

                  .offset-stepper__value {
                    min-width: 3.5rem !important;
                    text-align: center !important;
                    font-size: 0.9rem !important;
                    font-weight: 600 !important;
                    font-family: 'JetBrains Mono', monospace !important;
                    color: #23d5ab !important;
                    user-select: none !important;
                  }

                  /* Miscellaneous */
                  .text-group {
                    background: rgba(0, 0, 0, 0.2) !important;
                    padding: 1.2rem !important;
                    border-radius: 14px !important;
                    border: 1px solid rgba(255, 255, 255, 0.03) !important;
                  }

                  .text-group p {
                    display: flex !important;
                    justify-content: space-between !important;
                    margin: 0.5rem 0 !important;
                    color: rgba(255, 255, 255, 0.8) !important;
                    font-size: 0.9rem !important;
                    align-items: center !important;
                  }

                  .text-group p span:last-child {
                    font-family: 'JetBrains Mono', monospace !important;
                    color: #23d5ab !important;
                    background: rgba(35, 213, 171, 0.1) !important;
                    padding: 0.2rem 0.5rem !important;
                    border-radius: 6px !important;
                    font-size: 0.85rem !important;
                  }

                  .dots {
                    flex-grow: 1 !important;
                    border-bottom: 1px dashed rgba(255,255,255,0.2) !important;
                    margin: 0 10px !important;
                    opacity: 0.5 !important;
                  }

                  /* Animations */
                  .tab-content {
                    display: none;
                    opacity: 0;
                  }

                  .tab-content.active {
                    display: block !important;
                    animation: fadeUp 0.5s cubic-bezier(0.16, 1, 0.3, 1) forwards !important;
                  }

                  @keyframes fadeUp {
                    from {
                      opacity: 0;
                      transform: translateY(15px);
                    }
                    to {
                      opacity: 1;
                      transform: translateY(0);
                    }
                  }

                  /* Pre tags / Code blocks */
                  pre {
                    background: rgba(0, 0, 0, 0.3) !important;
                    border: 1px solid rgba(255, 255, 255, 0.1) !important;
                    border-radius: 12px !important;
                    padding: 1.2rem !important;
                    box-shadow: inset 0 2px 10px rgba(0,0,0,0.2) !important;
                  }

                  /* Providers list */
                  .sortable-list {
                    width: 100% !important;
                    padding: 0 !important;
                    margin: 0 !important;
                    list-style: none !important;
                  }
                  
                  .sortable-list li {
                    background: rgba(255,255,255,0.05) !important;
                    border: 1px solid rgba(255,255,255,0.1) !important;
                    margin-bottom: 8px !important;
                    padding: 10px 15px !important;
                    border-radius: 10px !important;
                    display: flex !important;
                    align-items: center !important;
                    justify-content: space-between !important;
                  }
                  
                  #options {
                    margin-top: 10px !important;
                  }

                  /* Modals Extra Styling (Unison & Language Exclusions) */
                  .modal-tab-container {
                    background: rgba(0, 0, 0, 0.2) !important;
                    border-bottom: 1px solid rgba(255, 255, 255, 0.05) !important;
                    padding: 0.5rem 1rem !important;
                    border-radius: 20px 20px 0 0 !important;
                  }
                  .modal-tab {
                    color: rgba(255, 255, 255, 0.6) !important;
                    border-radius: 12px !important;
                  }
                  .modal-tab.active {
                    background: rgba(255, 255, 255, 0.15) !important;
                    color: #fff !important;
                    box-shadow: 0 4px 15px rgba(0, 0, 0, 0.1) !important;
                    border: 1px solid rgba(255, 255, 255, 0.1) !important;
                  }
                  .lang-search-input {
                    background: rgba(0, 0, 0, 0.2) !important;
                    border: 1px solid rgba(255, 255, 255, 0.1) !important;
                    color: #fff !important;
                    border-radius: 10px !important;
                  }
                  .lang-search-input:focus {
                    background: rgba(0, 0, 0, 0.3) !important;
                    border-color: rgba(35, 213, 171, 0.5) !important;
                  }
                  .lang-pill {
                    background: rgba(255, 255, 255, 0.05) !important;
                    border: 1px solid rgba(255, 255, 255, 0.1) !important;
                    border-radius: 8px !important;
                  }
                  .lang-pill:hover {
                    background: rgba(255, 255, 255, 0.1) !important;
                  }
                  .position-frame {
                    border: 1px solid rgba(255, 255, 255, 0.1) !important;
                    background: rgba(0, 0, 0, 0.2) !important;
                    border-radius: 16px !important;
                  }
                  .position-cell {
                    background: rgba(255, 255, 255, 0.05) !important;
                  }
                  .position-cell:hover {
                    background: rgba(255, 255, 255, 0.1) !important;
                  }
                  .position-cell[data-selected="true"] {
                    background: rgba(35, 166, 213, 0.3) !important;
                  }
                  .position-cell[data-selected="true"]:before {
                    background: #23d5ab !important;
                  }

                  /* Fix Toast Notification Overlay */
                  #status, #status-css {
                    top: 42px !important;
                    z-index: 10001 !important;
                    border-radius: 0 0 16px 16px !important;
                    width: auto !important;
                    min-width: 250px !important;
                    max-width: 80% !important;
                    background: rgba(30, 31, 34, 0.95) !important;
                    backdrop-filter: blur(25px) !important;
                    -webkit-backdrop-filter: blur(25px) !important;
                    border: 1px solid rgba(255, 255, 255, 0.08) !important;
                    border-top: none !important;
                    box-shadow: 0 15px 30px rgba(0, 0, 0, 0.4) !important;
                    padding: 0.75rem 1.5rem !important;
                    font-size: 0.95rem !important;
                    font-weight: 500 !important;
                  }
                
`;

export function settingsWindowThemeCss(isNewEngine: boolean): string {
  return (
    WINDOW_CHROME_CSS + (isNewEngine ? NEW_OPTIONS_CSS : LEGACY_OPTIONS_CSS)
  );
}
