import AnimatedOrderButton from '../components/AnimatedOrderButton';
import Layout from '../components/Layout';

export default function AnimationDemo() {
  const handleOrderComplete = () => {
    console.log('Order completed!');
  };

  return (
    <Layout>
      <div className="py-16 text-center">
        <h1 className="text-4xl font-bold text-gray-900 mb-8">Animated Order Button Demo</h1>
        <p className="text-gray-600 mb-12">Click the button to see the full-screen truck delivery animation!</p>
        
        <div className="flex justify-center">
          <AnimatedOrderButton onOrderComplete={handleOrderComplete} />
        </div>
        
        <div className="mt-12 max-w-2xl mx-auto text-left">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Animation Features:</h2>
          <ul className="space-y-2 text-gray-600">
            <li>• Full-screen dark overlay covering entire website</li>
            <li>• Smaller, centered animation button (200x50px)</li>
            <li>• Truck drives in from the right</li>
            <li>• Doors open to load the package</li>
            <li>• Package moves into the truck</li>
            <li>• Truck drives away with motion lines</li>
            <li>• Success message appears with checkmark</li>
            <li>• "Processing your order..." text below</li>
            <li>• Compact success modal with white background</li>
            <li>• 10-second total animation duration</li>
          </ul>
        </div>
      </div>
    </Layout>
  );
}