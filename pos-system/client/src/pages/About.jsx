import { useNavigate } from 'react-router-dom';
import './About.css'; // Corrected the CSS import name
import './Dashboard.css'; // Import dashboard styles for layout
import UserProfile from './UserProfile';
import Sidebar from './Sidebar'; // Add sidebar import
import EmployeeSidebar from './EmployeeSidebar';
import { useRoleBasedNavigation } from '../utils/navigation';

const developers = [
    {
        name: 'Jilliana Abogado',
        role: '> Main Programmer',
        major: '> BSCS Student',
        email: '@jcabogado@tip.edu.ph',
        imageUrl: 'https://placehold.co/150x150/F8D7DA/495057?text=JA'
    },
    {
        name: 'Eljeanne Casero',
        role: '> System Designer',
        major: '> BSCS Student',
        email: '@gatcasero.tip.edu.ph',
        imageUrl: 'https://placehold.co/150x150/D1E7DD/495057?text=EC'
    },
    {
        name: 'Alexine Maloping',
        role: '> System Analyst, Developer',
        major: '> BSCS Student',
        email: '@alex.maloping@gmail.com',
        imageUrl: 'https://placehold.co/150x150/CFE2FF/495057?text=AM'
    }
];

const AboutUs = () => {
    const navigate = useNavigate();
    const { isEmployeeDashboard } = useRoleBasedNavigation();

    return (
        <div className="dashboard-container">
            {!isEmployeeDashboard && <Sidebar />}
            
            <main className="dashboard-main">
                {/* Only render header when not in employee dashboard */}
                {!isEmployeeDashboard && (
                    <header className="dashboard-header">
                        <h1>About BloomTrack</h1>
                        <UserProfile />
                    </header>
                )}

                <div className="about-us-content">
                    <div className="app-intro">
                        <h2>BLOOMTRACK</h2>
                        <p className="app-description">
                            BloomTrack is a comprehensive product management system designed specifically for the floral industry. With seamless Point of Sale (POS) and advanced inventory management features, BloomTrack helps flower shops streamline their operations, track inventory, and manage sales effortlessly. Tailored to the unique needs of florists, BloomTrack ensures that managing flowers, orders, and supplies is always efficient and organized.
                        </p>
                    </div>

                    <section className="developers-section">
                        <h2>About the Developers</h2>
                        <div className="developers-grid">
                            {developers.map((dev, index) => (
                                <div key={index} className="developer-card">
                                    <img src={dev.imageUrl} alt={`Profile of ${dev.name}`} className="developer-image" />
                                    <h3>{dev.name}</h3>
                                    <p>{dev.role}</p>
                                    <p>{dev.major}</p>
                                    <p>{dev.email}</p>
                                </div>
                            ))}
                        </div>
                    </section>

                    <footer className="contact-footer">
                        <p>CONTACT US: (+63) xxx xxxx or BloomTrackSupport@gmail.com</p>
                    </footer>
                </div>
            </main>
        </div>
    );
};

export default AboutUs;
