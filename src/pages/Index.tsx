import { Hero } from '@/components/home/Hero';
import { Bestsellers } from '@/components/home/Bestsellers';
import { FeaturedProducts } from '@/components/home/FeaturedProducts';
import { ShopByCategory } from '@/components/home/ShopByCategory';
import { WhyChoose } from '@/components/home/WhyChoose';
// import { CustomerReviews } from '@/components/home/CustomerReviews';

const Index = () => {
  return (
    <>
      <Hero />
      <ShopByCategory />
      <Bestsellers />
      <WhyChoose />
      {/* <CustomerReviews /> */}
    </>
  );
};

export default Index;
