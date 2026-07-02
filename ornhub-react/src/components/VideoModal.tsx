// src/components/VideoModal.tsx

import React, { useState } from 'react';
import type { Modulo, Comment } from '../types';

const ADMIN_EMAIL = 'deivi@ornhub.com';

interface VideoModalProps {
  modulo: Modulo;
  moduloIndex: number;
  userEmail: string | null;
  userName?: string | null;
  onClose: () => void;
  onLike: (index: number) => void;
  onDislike: (index: number) => void;
  onAddComment: (index: number, text: string) => void;
  onDeleteComment: (moduleIndex: number, commentIndex: number) => void;
}

const obtenerYoutubeId = (url: string): string | null => {
  const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
  const match = url.match(regExp);
  return match && match[2].length === 11 ? match[2] : null;
};

const VideoModal: React.FC<VideoModalProps> = ({
  modulo,
  moduloIndex,
  userEmail,
  onClose,
  onLike,
  onDislike,
  onAddComment,
  onDeleteComment,
}) => {
  const [commentText, setCommentText] = useState('');
  const videoId = obtenerYoutubeId(modulo.link);
  const esVideoDirecto = /\.(mp4|webm|ogg|mov)$/i.test(modulo.link);

  const hasLiked = userEmail ? modulo.likedBy.includes(userEmail) : false;
  const hasDisliked = userEmail ? modulo.dislikedBy.includes(userEmail) : false;

  const handleSubmitComment = () => {
    if (!commentText.trim()) return;
    onAddComment(moduloIndex, commentText);
    setCommentText('');
  };

  return (
    <div className="video-modal" onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}>
      <span className="close-video" onClick={onClose}>×</span>
      <div className="video-content-wrapper">

        {/* Reproductor */}
        <div className="video-container">
          {videoId ? (
            <iframe
              src={`https://www.youtube.com/embed/${videoId}?autoplay=1`}
              allow="autoplay; encrypted-media"
              allowFullScreen
              style={{ width: '100%', height: '100%', border: '1px solid #333' }}
            />
          ) : esVideoDirecto ? (
            <video
              src={modulo.link}
              controls
              autoPlay
              style={{ width: '100%', backgroundColor: 'black' }}
            />
          ) : (
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', color: '#aaa' }}>
              Link no reproducible
            </div>
          )}
        </div>

        {/* Info Panel */}
        <div className="video-info-panel">
          <div className="video-info-header">
            <h2>{modulo.titulo}</h2>
            <div className="video-stats-row">
              <span>Por <strong>{modulo.autor}</strong> • {modulo.views} visualizaciones</span>
              <div className="card-actions" style={{ display: 'flex' }}>
                <button
                  className={`action-button like ${hasLiked ? 'active' : ''}`}
                  onClick={() => onLike(moduloIndex)}
                  style={{ background: hasLiked ? '#28a74533' : '#333' }}
                >
                  {hasLiked ? '❤️' : '🤍'} <span>{modulo.likes}</span>
                </button>
                <button
                  className={`action-button dislike ${hasDisliked ? 'active' : ''}`}
                  onClick={() => onDislike(moduloIndex)}
                  style={{ background: hasDisliked ? '#dc354533' : '#333' }}
                >
                  👎 <span>{modulo.dislikes}</span>
                </button>
              </div>
            </div>
          </div>

          {/* Comentarios */}
          <div className="comment-section" style={{ display: 'block', border: 'none' }}>
            <h3 style={{ fontSize: '16px', marginBottom: '15px' }}>💬 {modulo.comments.length} Comentarios</h3>

            <div className="comment-input-area" style={{ display: 'block', marginBottom: '30px' }}>
              <textarea
                className="comment-input"
                placeholder="Añade un comentario público..."
                value={commentText}
                onChange={(e) => setCommentText(e.target.value)}
              />
              <button className="btn-comment-submit" onClick={handleSubmitComment}>
                Publicar
              </button>
            </div>

            <div className="comments-list">
              {modulo.comments.map((comment: Comment, commentIdx: number) => {
                const canDelete = userEmail && (comment.userEmail === userEmail || userEmail === ADMIN_EMAIL);
                return (
                  <div key={commentIdx} className="comment-item">
                    <div className="comment-author">
                      <span>
                        {comment.user}{' '}
                        <span className="comment-timestamp">
                          {new Date(comment.timestamp).toLocaleString()}
                        </span>
                      </span>
                      {canDelete && (
                        <button
                          className="btn-delete-comment"
                          onClick={() => {
                            if (window.confirm('¿Eliminar comentario?')) {
                              onDeleteComment(moduloIndex, commentIdx);
                            }
                          }}
                        >
                          Eliminar
                        </button>
                      )}
                    </div>
                    <div className="comment-text">{comment.text}</div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default VideoModal;
