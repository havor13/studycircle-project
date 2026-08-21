import React, { useEffect, useState } from 'react';
import api from '../api/api';
import '../styles.css';

function UserProfile() {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [editing, setEditing] = useState(false);
  const [formData, setFormData] = useState({
    photo_url: '',
    study_interests: '',
    skills: '',
    contributions: '',
    bio: ''
  });

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const res = await api.get('profiles/');
        // Assuming API returns current user's profile as first item
        const userProfile = res.data[0];
        setProfile(userProfile);
        setFormData({
          photo_url: userProfile.photo_url || '',
          study_interests: userProfile.study_interests || '',
          skills: userProfile.skills || '',
          contributions: userProfile.contributions || '',
          bio: userProfile.bio || ''
        });
        setLoading(false);
      } catch (err) {
        console.error('❌ Error fetching profile:', err.response?.data || err.message);
        setError('Failed to load profile.');
        setLoading(false);
      }
    };
    fetchProfile();
  }, []);

  const handleUpdate = async (e) => {
    e.preventDefault();
    try {
      const res = await api.put(`profiles/${profile.id}/`, formData);
      setProfile(res.data);
      setEditing(false);
      alert('✅ Profile updated successfully!');
    } catch (err) {
      console.error('❌ Error updating profile:', err.response?.data || err.message);
      alert('❌ Failed to update profile.');
    }
  };

  if (loading) return <p>Loading profile...</p>;
  if (error) return <p style={{ color: 'red' }}>{error}</p>;

  return (
    <div className="profile-container">
      <h2>👤 My Profile</h2>

      {!editing ? (
        <div className="profile-card">
          {profile.photo_url && (
            <img src={profile.photo_url} alt="Profile" className="profile-photo" />
          )}
          <p><strong>Username:</strong> {profile.user.username}</p>
          <p><strong>Email:</strong> {profile.user.email}</p>
          <p><strong>Study Interests:</strong> {profile.study_interests}</p>
          <p><strong>Skills:</strong> {profile.skills}</p>
          <p><strong>Contributions:</strong> {profile.contributions}</p>
          <p><strong>Bio:</strong> {profile.bio}</p>
          <button onClick={() => setEditing(true)}>Edit Profile</button>
        </div>
      ) : (
        <form className="edit-profile-form" onSubmit={handleUpdate}>
          <input
            type="text"
            placeholder="Photo URL"
            value={formData.photo_url}
            onChange={(e) => setFormData({ ...formData, photo_url: e.target.value })}
          />
          <input
            type="text"
            placeholder="Study Interests"
            value={formData.study_interests}
            onChange={(e) => setFormData({ ...formData, study_interests: e.target.value })}
          />
          <input
            type="text"
            placeholder="Skills"
            value={formData.skills}
            onChange={(e) => setFormData({ ...formData, skills: e.target.value })}
          />
          <input
            type="text"
            placeholder="Contributions"
            value={formData.contributions}
            onChange={(e) => setFormData({ ...formData, contributions: e.target.value })}
          />
          <textarea
            placeholder="Bio"
            value={formData.bio}
            onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
          />
          <button type="submit">Save Changes</button>
          <button type="button" onClick={() => setEditing(false)}>Cancel</button>
        </form>
      )}
    </div>
  );
}

export default UserProfile;
