import React from 'react';
import { Phone, Mail, Clock, MapPin, Users, Award, Truck, Shield } from 'lucide-react';

const AboutPage = () => {
    const features = [
        {
            icon: Truck,
            title: "Fast Delivery",
            description: "Get your food delivered in 30 minutes or less"
        },
        {
            icon: Shield,
            title: "Quality Assured",
            description: "Fresh ingredients and top-quality standards"
        },
        {
            icon: Users,
            title: "Expert Chefs",
            description: "Professional chefs preparing your meals"
        },
        {
            icon: Award,
            title: "Best Service",
            description: "Award-winning customer service experience"
        }
    ];

    const stats = [
        { number: "10,000+", label: "Happy Customers" },
        { number: "50+", label: "Restaurant Partners" },
        { number: "25", label: "Cities Served" },
        { number: "4.8", label: "Average Rating" }
    ];

    const teamMembers = [
        {
            name: "Sarah Johnson",
            role: "Head Chef",
            image: "https://via.placeholder.com/150x150/FFB6C1/FFFFFF?text=SJ"
        },
        {
            name: "Mike Chen",
            role: "Operations Manager",
            image: "https://via.placeholder.com/150x150/ADD8E6/FFFFFF?text=MC"
        },
        {
            name: "Emily Davis",
            role: "Customer Experience",
            image: "https://via.placeholder.com/150x150/FFB6C1/FFFFFF?text=ED"
        }
    ];

    return (
        <div className="min-h-screen bg-gradient-to-br from-pink-50 to-blue-50">
            {/* Hero Section */}
            <div className="bg-gradient-to-r from-pink-100 to-blue-100 py-16">
                <div className="container mx-auto px-4 text-center">
                    <h1 className="text-5xl md:text-6xl font-bold text-gray-800 mb-6">
                        About SooIcy
                    </h1>
                    <p className="text-xl text-gray-600 max-w-3xl mx-auto">
                        Bringing delicious food right to your doorstep since 2020. We connect food lovers
                        with their favorite restaurants and deliver exceptional dining experiences.
                    </p>
                </div>
            </div>

            <div className="container mx-auto px-4 py-12">
                {/* Our Story */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 mb-16">
                    <div className="bg-white rounded-xl shadow-lg p-8">
                        <h2 className="text-3xl font-bold text-gray-800 mb-6">Our Mission</h2>
                        <p className="text-gray-600 leading-relaxed mb-4">
                            We believe everyone deserves access to great food. Our mission is to connect food lovers
                            with their favorite restaurants and deliver exceptional dining experiences right to their homes.
                        </p>
                        <p className="text-gray-600 leading-relaxed">
                            Founded in 2020, SooIcy has grown from a small local delivery service to a trusted
                            platform serving thousands of customers across multiple cities. We're passionate about
                            food, technology, and creating memorable experiences for our customers.
                        </p>
                    </div>

                    <div className="bg-white rounded-xl shadow-lg p-8">
                        <h2 className="text-3xl font-bold text-gray-800 mb-6">Why Choose Us?</h2>
                        <ul className="space-y-3 text-gray-600">
                            <li className="flex items-start">
                                <span className="text-pink-500 mr-2">✓</span>
                                Fast and reliable delivery service
                            </li>
                            <li className="flex items-start">
                                <span className="text-pink-500 mr-2">✓</span>
                                Fresh, quality ingredients from trusted partners
                            </li>
                            <li className="flex items-start">
                                <span className="text-pink-500 mr-2">✓</span>
                                Wide variety of cuisines and dietary options
                            </li>
                            <li className="flex items-start">
                                <span className="text-pink-500 mr-2">✓</span>
                                Secure payment options and data protection
                            </li>
                            <li className="flex items-start">
                                <span className="text-pink-500 mr-2">✓</span>
                                24/7 customer support and satisfaction guarantee
                            </li>
                            <li className="flex items-start">
                                <span className="text-pink-500 mr-2">✓</span>
                                Eco-friendly packaging and sustainable practices
                            </li>
                        </ul>
                    </div>
                </div>

                {/* Features */}
                <div className="mb-16">
                    <h2 className="text-3xl font-bold text-center text-gray-800 mb-12">What Makes Us Special</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                        {features.map((feature, index) => {
                            const IconComponent = feature.icon;
                            return (
                                <div key={index} className="bg-white rounded-xl shadow-lg p-6 text-center hover:shadow-xl transition-shadow">
                                    <div className="w-16 h-16 bg-gradient-to-r from-pink-100 to-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                                        <IconComponent className="w-8 h-8 text-pink-600" />
                                    </div>
                                    <h3 className="text-xl font-bold text-gray-800 mb-2">{feature.title}</h3>
                                    <p className="text-gray-600">{feature.description}</p>
                                </div>
                            );
                        })}
                    </div>
                </div>

                {/* Stats */}
                <div className="bg-gradient-to-r from-pink-500 to-blue-500 rounded-xl p-8 mb-16">
                    <div className="grid grid-cols-2 lg:grid-cols-4 gap-8 text-center text-white">
                        {stats.map((stat, index) => (
                            <div key={index}>
                                <div className="text-4xl font-bold mb-2">{stat.number}</div>
                                <div className="text-lg opacity-90">{stat.label}</div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Team */}
                <div className="mb-16">
                    <h2 className="text-3xl font-bold text-center text-gray-800 mb-12">Meet Our Team</h2>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                        {teamMembers.map((member, index) => (
                            <div key={index} className="bg-white rounded-xl shadow-lg p-8 text-center hover:shadow-xl transition-shadow">
                                <img
                                    src={member.image}
                                    alt={member.name}
                                    className="w-24 h-24 rounded-full mx-auto mb-4 object-cover"
                                />
                                <h3 className="text-xl font-bold text-gray-800 mb-2">{member.name}</h3>
                                <p className="text-pink-600 font-semibold">{member.role}</p>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Contact Information */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    <div className="bg-white rounded-xl shadow-lg p-8">
                        <h2 className="text-2xl font-bold text-gray-800 mb-6">Get In Touch</h2>
                        <div className="space-y-4">
                            <div className="flex items-center space-x-3">
                                <Phone className="w-5 h-5 text-pink-600" />
                                <div>
                                    <p className="font-semibold text-gray-800">Phone</p>
                                    <p className="text-gray-600">+1 (555) 123-4567</p>
                                </div>
                            </div>
                            <div className="flex items-center space-x-3">
                                <Mail className="w-5 h-5 text-pink-600" />
                                <div>
                                    <p className="font-semibold text-gray-800">Email</p>
                                    <p className="text-gray-600">support@SooIcy.com</p>
                                </div>
                            </div>
                            <div className="flex items-center space-x-3">
                                <MapPin className="w-5 h-5 text-pink-600" />
                                <div>
                                    <p className="font-semibold text-gray-800">Address</p>
                                    <p className="text-gray-600">123 Main Street, Downtown, City 12345</p>
                                </div>
                            </div>
                            <div className="flex items-center space-x-3">
                                <Clock className="w-5 h-5 text-pink-600" />
                                <div>
                                    <p className="font-semibold text-gray-800">Hours</p>
                                    <p className="text-gray-600">24/7 Service Available</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="bg-white rounded-xl shadow-lg p-8">
                        <h2 className="text-2xl font-bold text-gray-800 mb-6">Send Us a Message</h2>
                        <form className="space-y-4">
                            <div>
                                <input
                                    type="text"
                                    placeholder="Your Name"
                                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500"
                                />
                            </div>
                            <div>
                                <input
                                    type="email"
                                    placeholder="Your Email"
                                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500"
                                />
                            </div>
                            <div>
                                <textarea
                                    rows="4"
                                    placeholder="Your Message"
                                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500"
                                ></textarea>
                            </div>
                            <button
                                type="submit"
                                className="w-full px-6 py-3 bg-gradient-to-r from-pink-500 to-blue-500 hover:from-pink-600 hover:to-blue-600 text-white rounded-lg transition-colors font-semibold"
                            >
                                Send Message
                            </button>
                        </form>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AboutPage;