const QuickTips = () => {
    return (
        <div className="sap-quicktips-container">
            {/* Header */}
            <div className="sap-quicktips-header">
                <span className="sap-quicktips-icon">💡</span>
                Quick Tips & Best Practices
            </div>

            {/* Content */}
            <div className="sap-quicktips-content">
                {/* Tip Sections */}
                {[
                    {
                        title: '🎬 Entertainment Tracking',
                        tips: [
                            'Use WS01 to add new items to wishlist',
                            'Track progress with episode/chapter counters',
                            'Rate items from 1-10 stars',
                            'Set priority for watch queue'
                        ]
                    },
                    {
                        title: '💰 Expense Management',
                        tips: [
                            'Record expenses daily using VA01',
                            'Categorize all transactions properly',
                            'Add receipt numbers for verification',
                            'Set recurring expenses for subscriptions'                            
                        ]
                    },
                    {
                        title: '🔍 Navigation',
                        tips: [
                            'Search by title or tags',
                            'Filter by category/status',
                            'Press F3 to go back',
                            'Export data from Extras menu'
                        ]
                    }
                ].map((section, idx) => (
                    <div key={idx} className="sap-quicktips-section">
                        <div className="sap-quicktips-section-title">
                            {section.title}
                        </div>
                        <ul className="sap-quicktips-list">
                            {section.tips.map((tip, i) => (
                                <li key={i} className="sap-quicktips-item">{tip}</li>
                            ))}
                        </ul>
                    </div>
                ))}
            </div>

            <style jsx>{`
                .sap-quicktips-container {
                    margin-top: 20px;
                    background: var(--sap-base);
                    border: 1px solid var(--sap-border);
                    border-radius: 6px;
                    box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
                    overflow: hidden;
                }

                .sap-quicktips-header {
                    padding: 10px 14px;
                    background: linear-gradient(180deg, #f8f9fa 0%, #eef0f2 100%);
                    border-bottom: 1px solid var(--sap-border);
                    font-size: 13px;
                    font-weight: 600;
                    color: var(--sap-text-primary);
                    display: flex;
                    align-items: center;
                    gap: 8px;
                }

                .sap-quicktips-icon {
                    font-size: 16px;
                    filter: grayscale(0%);
                }

                .sap-quicktips-content {
                    padding: 16px;
                    display: grid;
                    grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
                    gap: 20px;
                }

                .sap-quicktips-section {
                    min-width: 0;
                }

                .sap-quicktips-section-title {
                    font-size: 12px;
                    font-weight: 600;
                    margin-bottom: 8px;
                    color: var(--sap-text-primary);
                    display: flex;
                    align-items: center;
                    gap: 6px;
                }

                .sap-quicktips-list {
                    margin: 0;
                    padding-left: 20px;
                    font-size: 11px;
                    line-height: 1.8;
                    color: var(--sap-text-secondary);
                    list-style-type: none;
                    position: relative;
                }

                .sap-quicktips-item {
                    position: relative;
                    padding-left: 12px;
                    margin-bottom: 4px;
                }

                .sap-quicktips-item::before {
                    content: '▸';
                    position: absolute;
                    left: 0;
                    color: var(--sap-brand);
                    font-size: 10px;
                }

                /* Hover effects */
                .sap-quicktips-item:hover {
                    color: var(--sap-text-primary);
                }

                /* Dark Theme Styles */
                [data-theme="dark"] .sap-quicktips-container {
                    background: #1f1f3a;
                    border-color: #2a2a4a;
                    box-shadow: 0 1px 3px rgba(0, 0, 0, 0.3);
                }

                [data-theme="dark"] .sap-quicktips-header {
                    background: linear-gradient(180deg, #2a3a5a 0%, #1f2f4a 100%);
                    border-bottom-color: #2a2a4a;
                    color: #eaeaea;
                }

                [data-theme="dark"] .sap-quicktips-section-title {
                    color: #eaeaea;
                }

                [data-theme="dark"] .sap-quicktips-list {
                    color: #b0b0b0;
                }

                [data-theme="dark"] .sap-quicktips-item:hover {
                    color: #eaeaea;
                }

                [data-theme="dark"] .sap-quicktips-item::before {
                    color: #5b9bd5;
                }

                /* Blue Theme Variant */
                [data-theme="blue"] .sap-quicktips-header {
                    background: linear-gradient(135deg, var(--sap-brand) 0%, var(--sap-brand-dark) 100%);
                    color: white;
                    border-bottom-color: var(--sap-brand-dark);
                }

                [data-theme="blue"] .sap-quicktips-icon {
                    filter: brightness(1.2);
                }

                [data-theme="blue"] .sap-quicktips-section-title {
                    color: var(--sap-brand-dark);
                }

                [data-theme="blue"] .sap-quicktips-item::before {
                    color: var(--sap-brand);
                }

                /* High Contrast Theme */
                [data-theme="high-contrast"] .sap-quicktips-container {
                    background: #000000;
                    border: 2px solid #ffffff;
                }

                [data-theme="high-contrast"] .sap-quicktips-header {
                    background: #ffffff;
                    color: #000000;
                    border-bottom: 2px solid #ffffff;
                }

                [data-theme="high-contrast"] .sap-quicktips-section-title {
                    color: #ffffff;
                }

                [data-theme="high-contrast"] .sap-quicktips-list {
                    color: #cccccc;
                }

                [data-theme="high-contrast"] .sap-quicktips-item::before {
                    color: #00ff00;
                }

                /* Responsive adjustments */
                @media (max-width: 768px) {
                    .sap-quicktips-content {
                        padding: 12px;
                        grid-template-columns: 1fr;
                        gap: 16px;
                    }

                    .sap-quicktips-header {
                        padding: 8px 12px;
                        font-size: 12px;
                    }

                    .sap-quicktips-section-title {
                        font-size: 11px;
                    }

                    .sap-quicktips-list {
                        font-size: 10px;
                        padding-left: 16px;
                    }

                    .sap-quicktips-item {
                        padding-left: 10px;
                    }
                }

                @media (max-width: 480px) {
                    .sap-quicktips-container {
                        margin-top: 12px;
                        border-radius: 4px;
                    }

                    .sap-quicktips-content {
                        padding: 10px;
                    }

                    .sap-quicktips-header {
                        padding: 6px 10px;
                        font-size: 11px;
                    }

                    .sap-quicktips-icon {
                        font-size: 14px;
                    }
                }

                /* Animation for tip items */
                @keyframes fadeInUp {
                    from {
                        opacity: 0;
                        transform: translateY(5px);
                    }
                    to {
                        opacity: 1;
                        transform: translateY(0);
                    }
                }

                .sap-quicktips-section {
                    animation: fadeInUp 0.3s ease-out;
                }

                .sap-quicktips-section:nth-child(1) {
                    animation-delay: 0.1s;
                }

                .sap-quicktips-section:nth-child(2) {
                    animation-delay: 0.2s;
                }

                .sap-quicktips-section:nth-child(3) {
                    animation-delay: 0.3s;
                }

                /* Collapsible variant (optional) */
                .sap-quicktips-container.collapsed .sap-quicktips-content {
                    display: none;
                }

                .sap-quicktips-header.clickable {
                    cursor: pointer;
                    user-select: none;
                }

                .sap-quicktips-header.clickable:hover {
                    background: linear-gradient(180deg, #f0f2f4 0%, #e0e2e4 100%);
                }

                [data-theme="dark"] .sap-quicktips-header.clickable:hover {
                    background: linear-gradient(180deg, #303a5a 0%, #252f4a 100%);
                }

                /* Print styles */
                @media print {
                    .sap-quicktips-container {
                        border: 1px solid #ccc;
                        box-shadow: none;
                    }

                    .sap-quicktips-header {
                        background: #f5f5f5;
                        color: #000;
                    }

                    .sap-quicktips-icon {
                        display: none;
                    }
                }

                /* Reduced motion preference */
                @media (prefers-reduced-motion: reduce) {
                    .sap-quicktips-section {
                        animation: none;
                    }
                }
            `}</style>
        </div>
    );
};

export default QuickTips;