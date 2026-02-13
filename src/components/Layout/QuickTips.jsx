const QuickTips = () => {
    return (
        <div style={{
            marginTop: '20px',
            background: 'white',
            border: '1px solid var(--sap-border)',
            borderRadius: '3px'
        }}>
            {/* Header */}
            <div style={{
                padding: '8px 12px',
                background: 'linear-gradient(180deg, #f8f9fa 0%, #eef0f2 100%)',
                borderBottom: '1px solid var(--sap-border)',
                fontSize: '12px',
                fontWeight: '600',
                color: 'var(--sap-text-primary)',
                display: 'flex',
                alignItems: 'center',
                gap: '6px'
            }}>
                <span>💡</span>
                Quick Tips & Best Practices
            </div>

            {/* Content */}
            <div style={{
                padding: '12px',
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
                gap: '12px'
            }}>
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
                    <div key={idx}>
                        <div style={{
                            fontSize: '11px',
                            fontWeight: '600',
                            marginBottom: '6px',
                            color: 'var(--sap-text-primary)'
                        }}>
                            {section.title}
                        </div>
                        <ul style={{
                            margin: 0,
                            paddingLeft: '18px',
                            fontSize: '11px',
                            lineHeight: '1.6',
                            color: 'var(--sap-text-secondary)'
                        }}>
                            {section.tips.map((tip, i) => (
                                <li key={i}>{tip}</li>
                            ))}
                        </ul>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default QuickTips;