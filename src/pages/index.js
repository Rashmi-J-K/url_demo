import { useState, useEffect } from 'react';
import { debounce } from 'lodash';
import styles from '../styles/style.module.css';

export default function Home() {
  const [originalUrl, setOriginalUrl] = useState('');
  const [shortUrl, setShortUrl] = useState('');
  const [showShortUrl, setShowShortUrl] = useState(false);
  const [recentUrls, setRecentUrls] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize] = useState(10);



  const getISODate = (timestamp) => {
    return new Date(timestamp).toISOString().replace(/:/g, '');
  };

  const getFormattedDate = (timestamp) => {
    const rawDate = new Date(timestamp);
    const formattedDate = rawDate.toISOString().replace(/[^0-9]/g, '');
    return formattedDate;
  };
  


  const fetchRecentUrls = async () => {
    try {
      const currentTimestamp = getISODate('2023-11-28 13:53:00.947793');
      const response = await fetch(`${window.location.origin}/api/db?timestamp=${currentTimestamp}&page=${currentPage}&pageSize=${pageSize}`);

      if (response.ok) {
        const data = await response.json();
        // Sort the data based on the timestamp in descending order
        const sortedData = data.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
        // Slice the array to get only the latest 4 URLs
        const latestUrls = sortedData.slice(0, 4);
        setRecentUrls(latestUrls);
      } else {
        console.error('Error fetching recent URLs:', response.status, response.statusText);
      }
    } catch (error) {
      console.error('An unexpected error occurred during fetch:', error);
    }
  };



  // Debounce the handleShorten function
  const debouncedHandleShorten = debounce(async () => {
    try {
      const response = await fetch(`${window.location.origin}/api/shorten`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ originalUrl }),
      });

      if (response.ok) {
        const { shortUrl } = await response.json();
        setShortUrl(shortUrl);
        setShowShortUrl(true);
        // Fetch recent URLs immediately after shortening
        fetchRecentUrls();
      } else {
        console.error('Error shortening URL:', response.status, response.statusText);
      }
    } catch (error) {
      console.error('An unexpected error occurred during fetch:', error);
    }
  }, 300); // Debounce for 300 milliseconds

  useEffect(() => {
    // Fetch recent URLs on initial load
    fetchRecentUrls();

    // Fetch recent URLs every 4 seconds with pagination (example: page 1, pageSize 10)
    const intervalId = setInterval(() => {
      setCurrentPage(1); // Reset to the first page on each poll
      fetchRecentUrls();
    }, 4000); // Poll every 4 seconds

    return () => clearInterval(intervalId); // Cleanup on unmount
  }, []);

  return (
    <div className={styles.container}>
      <h1>URL Shortener</h1>
      <div className={styles.inputContainer}>
        <input
          type="text"
          value={originalUrl}
          onChange={(e) => setOriginalUrl(e.target.value)}
          className={styles.inputStyle}
          placeholder="Enter your URL"
        />
        <button onClick={debouncedHandleShorten} className={styles.buttonStyle}>
          Shorten URL
        </button>
      </div>
      {showShortUrl && shortUrl && (
        <div className={styles.resultContainer}>
          <p>Short URL:</p>
          <a href={`${window.location.origin}/api/redirect/${shortUrl}`} target="_blank" rel="noopener noreferrer" className={styles.shortUrlStyle}>
            {`https://rashmi.jk/${shortUrl}`}
          </a>
        </div>
      )}
      <div className={styles.recentUrlsContainer}>
        <h3>Recent URLs</h3>
        <ul>
          {recentUrls.map((url) => (
            <li key={url.short_url}>
              Guest_{getFormattedDate(url.created_at)}: 
              <a href={`${window.location.origin}/api/redirect/${url.short_url}`} target="_blank" rel="noopener noreferrer">
                {`   https://rashmi.jk/${url.short_url}`}
              </a>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
