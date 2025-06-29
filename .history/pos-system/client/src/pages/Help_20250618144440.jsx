import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './HelpCenter.css'; // We'll create this CSS file next

// Mock data for the Q&A section based on your image
const faqData = [
  {
    icon: '📦',
    question: 'How do I add a new product to the system?',
    answer: 'Go to the "Product Registration" section, fill in the product name, category, stock, quantity, and supplier details, then click "Register Product".'
  },
  {
    icon: '🚚',
    question: 'Can I restock from multiple suppliers for the same product?',
    answer: 'Yes, admins can restock products from different suppliers. The system allows you to adjust the quantity from each supplier, and it will update the product information accordingly.'
  },
  {
    icon: '💳',
    question: 'How does the billing system work in BloomTrack?',
    answer: 'BloomTrack supports two styles of billing: Retail for regular sales and Events for scheduled occasions. Both funnels lead to a billing and payment page.'
  },
  {
    icon: '👥',
    question: 'How do I manage users in BloomTrack?',
    answer: 'As an Admin, you can register new users and assign them roles. Admins have full access, while employees have limited access based on permissions provided by the Admin.'
  },
  {
    icon: '🔑',
    question: 'How do I reset my password?',
    answer: 'If you forget your password, you can use the "Forgot Password" feature. An OTP will be sent to your registered phone number, allowing you to reset your password.'
  },
  {
    icon: '📋',
    question: 'How can I manage products in BloomTrack?',
    answer: 'Admins can register, edit, and view all products from the Product Management section. Employees can view inventory but cannot edit product details.'
  },
  {
    icon: '↔️',
    question: 'What are the two types of transactions in BloomTrack?',
    answer: 'There are two main types of transactions: Retail for regular sales and Events for handling larger, scheduled occasions. You can access both in the Transactions section.'
  },
  {
    icon: '⚙️',
    question: 'What is the role of the "Maintenance" module?',
    answer: 'The Maintenance module allows Admins to manage system settings, view logs, backup the system, and keep the system running smoothly and securely.'
  },
  {
    icon: '📊',
    question: 'How can I generate reports in BloomTrack?',
    answer: 'Admins can generate reports related to Sales, Inventory, and Spoilage by navigating to the Reports module in the Admin Dashboard.'
  },
  {
    icon: '📉',
    question: 'How do I receive alerts for low stocks?',
    answer: 'Both Admins and Employees can receive low stock alerts in the system. These alerts are triggered when inventory levels fall below a predefined threshold.'
  },
  {
    icon: '💡',
    question: 'How does the recommendations alert work?',
    answer: 'The system will recommend flowers/products that are suitable for the season and when flowers are in demand for that season.'
  },
  {
    icon: '📅',
    question: 'How do I schedule events in BloomTrack?',
    answer: 'Admins can schedule upcoming events under the Events module. You will be able to specify the event date, products, or services that are included in the system.'
  }
];

// Reusable Q&A Card Component
const QnaCard = ({ item, isOpen, onClick }) => (
    <div className={`qna-card ${isOpen ? 'open' : ''}`} onClick={onClick}>
        <div className="qna-header">
            <span className="qna-icon">{item.icon}</span>
            <h3>Q&A</h3>
        </div>
        <p className="qna-question">{item.question}</p>
        {isOpen && <p className="qna-answer">{item.answer}</p>}
    </div>
);


const HelpCenter = () => {
    const navigate = useNavigate();
    const [openCard, setOpenCard] = useState(null); // State to track which card is open

    const handleCardClick = (index) => {
        // If the clicked card is already open, close it. Otherwise, open it.
        setOpenCard(openCard === index ? null : index);
    };

    return (
        <div className="help-page-layout">
            <header className="help-page-header">
                <button className="back-arrow" onClick={() => navigate(-1)}>‹</button>
                <div className="user-profile-button">
                    <span>User Profile</span>
                    <span className="dropdown-arrow">▼</span>
                </div>
            </header>

            <main className="help-center-content">
                <div className="help-center-title">
                    <h1>Help Center</h1>
                    <p>This is your quick guide to using BloomTrack, the all-in-one system from Flowers by Edmar. Use this page to get familiar with the core features that will help you manage your floral business.</p>
                </div>

                <div className="qna-grid">
                    {faqData.map((item, index) => (
                        <QnaCard 
                            key={index} 
                            item={item}
                            isOpen={openCard === index}
                            onClick={() => handleCardClick(index)}
                        />
                    ))}
                </div>
            </main>
        </div>
    );
};

export default HelpCenter;
