import fs from 'fs';
import path from 'path';

export interface StoredMessage {
  id: string;
  senderId: string;
  receiverId: string;
  productId?: string | null;
  message: string;
  read: boolean;
  createdAt: string;
}

export interface PeerUser {
  id: string;
  name: string;
  avatarUrl?: string | null;
  location?: string | null;
}

export const MOCK_USERS: Record<string, PeerUser> = {
  'usr-1': { id: 'usr-1', name: 'Karthik Raja', location: 'T. Nagar, Chennai' },
  'usr-2': { id: 'usr-2', name: 'Vignesh M', location: 'Velachery, Chennai' },
  'usr-3': { id: 'usr-3', name: 'Suresh Kumar', location: 'Anna Nagar, Chennai' },
  'usr-4': { id: 'usr-4', name: 'Ananya Ramesh', location: 'Adyar, Chennai' },
  'usr-5': { id: 'usr-5', name: 'Deepak Nathan', location: 'Koramangala, Bangalore' },
  'usr-6': { id: 'usr-6', name: 'Apex Realtors', location: 'RS Puram, Coimbatore' },
  'usr-7': { id: 'usr-7', name: 'Pravin Studio', location: 'T. Nagar, Chennai' },
  'usr-8': { id: 'usr-8', name: 'Balaji S', location: 'Velachery, Chennai' },
  'usr-9': { id: 'usr-9', name: 'Gowtham R', location: 'Chennai' },
  'usr-10': { id: 'usr-10', name: 'Pooja V', location: 'Chennai' },
  'usr-11': { id: 'usr-11', name: 'Aravind S', location: 'Chennai' },
  'usr-12': { id: 'usr-12', name: 'CleanPro Services', location: 'Chennai' },
  'usr-demo-iyyanar': { id: 'usr-demo-iyyanar', name: 'Iyyanar', location: 'Chennai' },
};

export const MOCK_PRODUCTS: Record<string, any> = {
  'prod-1': {
    id: 'prod-1',
    title: 'Maruti Swift 2019',
    price: 450000,
    imageUrl: '/images/car_red.jpg',
    condition: 'Like New',
    status: 'active',
    city: 'Chennai',
  },
  'prod-2': {
    id: 'prod-2',
    title: 'Yamaha FZ',
    price: 85000,
    imageUrl: '/images/bike_yamaha.jpg',
    condition: 'Good',
    status: 'active',
    city: 'Chennai',
  },
  'prod-3': {
    id: 'prod-3',
    title: 'iPhone 13 128GB',
    price: 28000,
    imageUrl: '/images/phone_purple.jpg',
    condition: 'Like New',
    status: 'active',
    city: 'Chennai',
  },
  'prod-4': {
    id: 'prod-4',
    title: '3 Seater Sofa',
    price: 12000,
    imageUrl: '/images/sofa_brown.jpg',
    condition: 'Good',
    status: 'active',
    city: 'Chennai',
  },
  'prod-5': {
    id: 'prod-5',
    title: 'MacBook Air M1 (256GB SSD)',
    price: 45000,
    imageUrl: '/images/laptop_macbook.jpg',
    condition: 'Like New',
    status: 'active',
    city: 'Chennai',
  },
  'prod-6': {
    id: 'prod-6',
    title: '2 BHK Luxury Apartment',
    price: 7500000,
    imageUrl: '/images/apartment.jpg',
    condition: 'Brand New',
    status: 'active',
    city: 'Chennai',
  },
  'prod-7': {
    id: 'prod-7',
    title: 'Canon EOS 1500D DSLR + 18-55mm',
    price: 24500,
    imageUrl: '/images/camera.jpg',
    condition: 'Like New',
    status: 'active',
    city: 'Chennai',
  },
  'prod-8': {
    id: 'prod-8',
    title: 'Royal Enfield Classic 350',
    price: 135000,
    imageUrl: '/images/bike_yamaha.jpg',
    condition: 'Good',
    status: 'active',
    city: 'Chennai',
  },
  'prod-9': {
    id: 'prod-9',
    title: 'Pure Leather Rider Jacket (M)',
    price: 3200,
    imageUrl: '/images/fashion.jpg',
    condition: 'Good',
    status: 'active',
    city: 'Chennai',
  },
  'prod-10': {
    id: 'prod-10',
    title: 'Premium Pet Bed & Leash Set',
    price: 1800,
    imageUrl: '/images/pet.jpg',
    condition: 'Brand New',
    status: 'active',
    city: 'Chennai',
  },
  'prod-11': {
    id: 'prod-11',
    title: 'Algorithms & JS Handbook Set',
    price: 950,
    imageUrl: '/images/books.jpg',
    condition: 'Good',
    status: 'active',
    city: 'Chennai',
  },
  'prod-12': {
    id: 'prod-12',
    title: 'Deep Home Sanitization Service',
    price: 1499,
    imageUrl: '/images/services.jpg',
    condition: 'Brand New',
    status: 'active',
    city: 'Chennai',
  },
};

const STORE_FILE_PATH = path.resolve(process.cwd(), 'chat_messages_store.json');

const DEFAULT_SEEDED_MESSAGES: StoredMessage[] = [];

// Load persisted messages from JSON file on server start
function loadPersistedMessages(): StoredMessage[] {
  try {
    if (fs.existsSync(STORE_FILE_PATH)) {
      const raw = fs.readFileSync(STORE_FILE_PATH, 'utf-8');
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) {
        return parsed;
      }
    }
  } catch (err) {
    console.error('Error loading chat messages file:', err);
  }
  return [];
}

// Load persisted messages from JSON file on server start or reload
export let inMemoryMessages: StoredMessage[] = loadPersistedMessages();

export function saveMessageToStore(msg: StoredMessage) {
  inMemoryMessages.push(msg);
  try {
    fs.writeFileSync(STORE_FILE_PATH, JSON.stringify(inMemoryMessages, null, 2), 'utf-8');
  } catch (err) {
    console.error('Error persisting message to file:', err);
  }
}

export function deleteConversationFromStore(userId1: string, userId2: string) {
  inMemoryMessages = inMemoryMessages.filter((m) => {
    const isThisConv =
      (m.senderId === userId1 && m.receiverId === userId2) ||
      (m.senderId === userId2 && m.receiverId === userId1);
    return !isThisConv;
  });
  try {
    fs.writeFileSync(STORE_FILE_PATH, JSON.stringify(inMemoryMessages, null, 2), 'utf-8');
  } catch (err) {
    console.error('Error writing chat messages after deletion:', err);
  }
}

export function clearAllMessagesFromStore() {
  inMemoryMessages = [];
  try {
    fs.writeFileSync(STORE_FILE_PATH, JSON.stringify([], null, 2), 'utf-8');
  } catch (err) {
    console.error('Error clearing chat messages file:', err);
  }
}

export function updateMessageInStore(predicate: (m: StoredMessage) => boolean, updater: (m: StoredMessage) => void) {
  let changed = false;
  for (const m of inMemoryMessages) {
    if (predicate(m)) {
      updater(m);
      changed = true;
    }
  }
  if (changed) {
    try {
      fs.writeFileSync(STORE_FILE_PATH, JSON.stringify(inMemoryMessages, null, 2), 'utf-8');
    } catch {
      // Ignore
    }
  }
}

export function getSmartSellerReply(messageText: string, sellerName: string, productTitle?: string): string {
  // Check if this message is a structured Make-an-Offer
  if (messageText.includes('[OFFER:')) {
    try {
      const match = messageText.match(/\[OFFER:(.*?)\]/);
      if (match && match[1]) {
        const offer = JSON.parse(match[1]);
        const offerAmt = offer.amount || 0;
        const origPrice = offer.originalPrice || offerAmt;
        const prodName = offer.productTitle || productTitle || 'this item';

        if (offer.status === 'accepted') {
          return `Awesome! I'm glad we reached an agreement on ₹${offerAmt.toLocaleString('en-IN')}. Let me know your preferred payment method or meetup time!`;
        }

        if (offerAmt >= origPrice * 0.8) {
          // Accept offer
          const acceptedOffer = {
            ...offer,
            status: 'accepted',
          };
          return `[OFFER:${JSON.stringify(acceptedOffer)}] That's a fair offer! I accept ₹${offerAmt.toLocaleString('en-IN')} for the ${prodName}. When would you like to collect it?`;
        } else {
          // Decline or counter
          const counterAmt = Math.round(origPrice * 0.9);
          const declinedOffer = {
            ...offer,
            status: 'declined',
          };
          return `[OFFER:${JSON.stringify(declinedOffer)}] Thanks for the offer of ₹${offerAmt.toLocaleString('en-IN')}, but that's a bit too low. The best price I can do is ₹${counterAmt.toLocaleString('en-IN')}. Would that work for you?`;
        }
      }
    } catch {
      // Fallback
    }
  }

  const text = messageText.toLowerCase();

  if (text.includes('offer') || text.includes('negotiate') || text.includes('lowest')) {
    return `Feel free to use the "🤝 Make an Offer" button to send your price proposal directly!`;
  }
  if (text.includes('available') || text.includes('still have') || text.includes('available?')) {
    return `Hi! Yes, ${productTitle ? `the ${productTitle}` : 'this item'} is still available and ready for pickup!`;
  }
  if (text.includes('price') || text.includes('discount') || text.includes('deal')) {
    return `The price is slightly negotiable. Click "Make an Offer" above to suggest your best price!`;
  }
  if (text.includes('meet') || text.includes('location') || text.includes('where') || text.includes('place')) {
    return `I am available to meet in Chennai near the city center or metro station. When are you free?`;
  }
  if (text.includes('condition') || text.includes('working') || text.includes('warranty') || text.includes('bill')) {
    return `It is in fantastic working condition without any defects. You are welcome to test it thoroughly before buying!`;
  }
  if (text.includes('hi') || text.includes('hello') || text.includes('hey')) {
    return `Hello! Thanks for reaching out to ${sellerName}. How can I help you today?`;
  }
  return `Thanks for your message! Yes, I am happy to answer any questions or arrange a convenient time for inspection.`;
}
