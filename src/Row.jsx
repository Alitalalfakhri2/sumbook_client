import React, { useState, useRef, useEffect } from "react";
import { books } from "./data/books.js"; 
import "./styles/Home.css";
import cart from "./scripts/cart.js";
import { useNavigate } from "react-router-dom";
import { FaCheckCircle } from 'react-icons/fa';
import { getBooks } from './data/books.js';
import {useSelector , useDispatch} from 'react-redux';
import {loadBooks} from './features/generals/booksSlice.js'
import axios from 'axios'
import {backendUrl} from './constant.js'
import { login } from './features/user/userSlice'; 
import AOS from 'aos';
import 'aos/dist/aos.css'; // Don't forget this!

const BookStore = (props) => {
  const user = useSelector(state => state.user);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const categories = ["Marketing", "Business", "Self-Development", "Stories"];
  const booksState = useSelector((state) => state.books);

  // State management
  const [booksArray, setBooksArray] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const dialogRef = useRef(null);
  const [selectedBook, setSelectedBook] = useState({ name: "", id: null });

  // Initialize AOS
  useEffect(() => {
    AOS.init({
      duration: 1000,
      
      once: true // Animations only happen once
    });
  }, []);

  // Fetch books
  useEffect(() => {
    const fetchBooks = async () => {
      try {
        const data = await getBooks();
        setBooksArray(data);  
        localStorage.setItem('booksStorage', JSON.stringify(data));
      } catch (err) {
        console.error("Error fetching books:", err);
        setError("Failed to load books. Please try again later.");
      } finally {
        setLoading(false);
      }
    };

    fetchBooks();
  }, []);

  // Check auth status
  useEffect(() => {
    const checkAuth = async () => {
      const user = JSON.parse(localStorage.getItem("user"));
      const token = user?.token;

      if (!token) return;

      try {
        const res = await axios.get(`${backendUrl}/auth/status`, {
          headers: { Authorization: `Bearer ${token}` }
        });

        if (res.data.loggedIn) {
          dispatch(login({ 
            uid: res.data.userId, 
            type: res.data.type 
          }));
        }
      } catch (error) {
      
      }
    };

    checkAuth();
  }, [dispatch]);

  const BookCard = ({ book }) => {
    const { image, name, rating, priceCents, id } = book;
    const price = (priceCents / 100).toFixed(2);

    const handleReadMore = () => navigate(`/detail/${id}`);

    return (
      <div className="book-card"  data-aos="zoom-in" data-aos-opacity="1">
        <img src={image} alt={name} />
        <h3>{name}</h3>
        <p>Price: ${price}</p>
        <p>
          Rating: {rating.stars}/10 ({rating.count} reviews)
        </p>
        <div className="card-buttons">
          <button
            onClick={() => setSelectedBook({ name, id })}
            className="buy-button"
          >
            Buy
          </button>
          <button
            className="read-more-button"
            onClick={handleReadMore}
          >
            Read More
          </button>
        </div>
      </div>
    );
  };

  const Row = ({ title, books }) => (
    <div className="book-row">
      <h2>{title}</h2>
      <div className="book-list">
        {books.map((book) => (
          <BookCard key={book.id} book={book} />
        ))}
      </div>
    </div>
  );

  const handleAddToCart = (id) => {
    cart.addToCart(id);
    props.updateCart?.();
    dialogRef.current.close();
  };

  // Show dialog when a book is selected
  useEffect(() => {
    if (selectedBook.id) {
      dialogRef.current.showModal();
    }
  }, [selectedBook]);

  if (loading) return <div className="loading">Loading...</div>;
  if (error) return <div className="error">{error}</div>;

  return (
    <div>
      {categories.map((category) => {
        const booksInCategory = booksArray.filter(
          (book) => book.category === category
        );
        return booksInCategory.length > 0 ? (
          <Row key={category} title={category} books={booksInCategory} />
        ) : null;
      })}

      <dialog ref={dialogRef} className="confirmation-dialog">
        <div className="dialog-content">
          <p>Do you want to buy {selectedBook.name}?</p>
          <div className="dialog-buttons">
            <button 
              onClick={() => handleAddToCart(selectedBook.id)} 
              className="buy-button"
            >
              Buy
            </button>
            <button 
              onClick={() => dialogRef.current.close()} 
              className="read-more-button"
            >
              Cancel
            </button>
          </div>
        </div>
      </dialog>
    </div>
  );
};

export default BookStore;