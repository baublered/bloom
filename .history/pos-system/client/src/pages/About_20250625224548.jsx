import { useNavigate } from 'react-router-dom';
import './About.css'; // Corrected the CSS import name
import UserProfile from './UserProfile'; 

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
        role: '> System Analyst',
        major: '> BSCS Student',
        email: '@aamaloping@tip.edu.ph',
        imageUrl: 'https://placehold.co/150x150/CFE2FF/495057?text=AM'
    }
];

const AboutUs = () => {
    const navigate = useNavigate();

    return (
        <div className="about-us-layout">
            <header className="about-us-header">
                <button className="back-arrow" onClick={() => navigate(-1)}>‹</button>
                {/* --- UPDATED: Replaced the static div with the UserProfile component --- */}
                <UserProfile />
            </header>
            <main className="about-us-content">
                <h2>About us</h2>
                <h1>BLOOMTRACK</h1>
                <p className="app-description">
                    BloomTrack is a comprehensive product management system designed specifically for the floral industry. With seamless Point of Sale (POS) and advanced inventory management features, BloomTrack helps flower shops streamline their operations, track inventory, and manage sales effortlessly. Tailored to the unique needs of florists, BloomTrack ensures that managing flowers, orders, and supplies is always efficient and organized.
                </p>

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
            </main>
        </div>
    );
};

export default AboutUs;
