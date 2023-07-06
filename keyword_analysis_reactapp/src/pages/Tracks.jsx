import React from "react";
import { useEffect } from "react";
import { useState } from "react";
import axios from "axios";
import { Link } from "react-router-dom";
import Button from 'react-bootstrap/Button';

const Tracks = () => {
  const [tracks, setTracks] = useState([]);

  useEffect(() => {
    const fetchAllTracks = async () => {
      try {
        const res = await axios.get("http://127.0.0.1:8000/api/track-list/");
        setTracks(res.data);
      } catch (err) {
        console.log(err);
      }
    };
    fetchAllTracks();
  }, []);

  const handleDelete = async (id) => {
    try {
      await axios.delete("http://127.0.0.1:8000/api/track-delete/" + id);
      window.location.reload();
    } catch (err) {
      console.log(err);
    }
  };

  return (
    <div>
      <h1>Tracks</h1>
      {tracks.map((track, idx) => (
        <div key={idx}>
          <p>{track.Keyword}</p>
          <p>
            {track.Industries.map((industry, index) => (
              <span key={index}>{industry.Name}&nbsp;</span>
            ))}
          </p>
          <p>
            {track.Times.map((time, index) => (
              <span key={index}>{time.Date}&nbsp;</span>
            ))}
          </p>
          <button
            className="delete"
            onClick={() => handleDelete(track.Track_ID)}
          >
            Delete
          </button>
          <button>
            <Link to={`/Track/${track.Track_ID}`}>查看股價走勢</Link>
          </button>
          <Button variant="primary">Primary</Button>
        </div>
      ))}
      {/* <button>
        <Link to="/AddTrack">Add new track</Link>
      </button> */}
    </div>
  );
};

export default Tracks;
