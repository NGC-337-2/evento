import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import CategoryDropdown from './CategoryDropdown';
import { BrowserRouter } from 'react-router-dom';
import { Provider } from 'react-redux';
import { configureStore } from '@reduxjs/toolkit';
import eventsReducer from '../features/events/eventsSlice';

// Mock store
const store = configureStore({
  reducer: {
    events: eventsReducer,
  },
});

describe('CategoryDropdown', () => {
  it('renders the Categories button', () => {
    render(
      <Provider store={store}>
        <BrowserRouter>
          <CategoryDropdown />
        </BrowserRouter>
      </Provider>
    );
    
    expect(screen.getByText(/Categories/i)).toBeInTheDocument();
  });

  it('filters categories based on search input', async () => {
    render(
      <Provider store={store}>
        <BrowserRouter>
          <CategoryDropdown />
        </BrowserRouter>
      </Provider>
    );

    // Click to open menu
    fireEvent.click(screen.getByText(/Categories/i));

    const input = screen.getByPlaceholderText(/Search categories.../i);
    fireEvent.change(input, { target: { value: 'music' } });

    expect(screen.getByText('music')).toBeInTheDocument();
    expect(screen.queryByText('sports')).not.toBeInTheDocument();
  });
});
