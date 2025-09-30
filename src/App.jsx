import React, { useState, useEffect } from 'react';
import { Upload, Trash2, Search, Eye, Download, Lock, LogOut, Menu, X, BookOpen, Library } from 'lucide-react';

export default function App() {
  const [documents, setDocuments] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [isAdmin, setIsAdmin] = useState(false);
  const [password, setPassword] = useState('');
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [showMenu, setShowMenu] = useState(false);
  const [newDoc, setNewDoc] = useState({ title: '', ageRestriction: '', file: null });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDocuments();
  }, []);

  const fetchDocuments = async () => {
    try {
      const response = await fetch('/api/documents');
      const data = await response.json();
      setDocuments(data);
      setLoading(false);
    } catch (error) {
      console.error('Error al cargar documentos:', error);
      setLoading(false);
    }
  };

  const handleLogin = async () => {
    try {
      const response = await fetch('/api/auth', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password })
      });
      
      const data = await response.json();
      
      if (data.success) {
        setIsAdmin(true);
        setShowLoginModal(false);
        setPassword('');
      } else {
        alert('Contraseña incorrecta');
      }
    } catch (error) {
      alert('Error al autenticar');
    }
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file && file.type === 'application/pdf') {
      setNewDoc({ ...newDoc, file });
    } else {
      alert('Por favor selecciona un archivo PDF');
    }
  };

  const handleUpload = async () => {
    if (!newDoc.title || !newDoc.ageRestriction || !newDoc.file) {
      alert('Por favor completa todos los campos');
      return;
    }

    const reader = new FileReader();
    reader.onload = async (e) => {
      try {
        const response = await fetch('/api/documents', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            title: newDoc.title,
            ageRestriction: newDoc.ageRestriction,
            fileData: e.target.result
          })
        });

        if (response.ok) {
          setNewDoc({ title: '', ageRestriction: '', file: null });
          setShowUploadModal(false);
          fetchDocuments();
          alert('Documento subido exitosamente');
        } else {
          alert('Error al subir el documento');
        }
      } catch (error) {
        alert('Error al subir el documento');
      }
    };
    reader.readAsDataURL(newDoc.file);
  };

  const handleDelete = async (id) => {
    if (!window.confirm('¿Estás seguro de eliminar este documento?')) return;

    try {
      const response = await fetch(`/api/documents?id=${id}`, {
        method: 'DELETE'
      });

      if (response.ok) {
        fetchDocuments();
        alert('Documento eliminado');
      } else {
        alert('Error al eliminar el documento');
      }
    } catch (error) {
      alert('Error al eliminar el documento');
    }
  };

  const filteredDocs = documents.filter(doc =>
    doc.title.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-black text-white relative overflow-hidden">
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute w-96 h-96 bg-purple-600 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob"></div>
        <div className="absolute w-96 h-96 bg-blue-600 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-2000 right-0"></div>
        <div className="absolute w-96 h-96 bg-pink-600 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-4000 bottom-0 left-1/2"></div>
      </div>

      <style>{`
        @keyframes blob {
          0%, 100% { transform: translate(0, 0) scale(1); }
          33% { transform: translate(30px, -50px) scale(1.1); }
          66% { transform: translate(-20px, 20px) scale(0.9); }
        }
        .animate-blob {
          animation: blob 7s infinite;
        }
        .animation-delay-2000 {
          animation-delay: 2s;
        }
        .animation-delay-4000 {
          animation-delay: 4s;
        }
      `}</style>

      <div className="relative z-10">
        <nav className="bg-gray-900 bg-opacity-90 backdrop-blur-lg border-b border-gray-800 sticky top-0 z-50">
          <div className="container mx-auto px-4">
            <div className="flex items-center justify-between h-16">
              <div className="flex items-center gap-3">
                <div className="bg-gradient-to-br from-purple-500 to-pink-500 p-2 rounded-lg">
                  <BookOpen className="w-6 h-6" />
                </div>
                <h1 className="text-xl font-bold text-white">El Rincón Del Funado</h1>
              </div>

              <div className="hidden md:flex items-center gap-4">
                <button
                  onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
                  className="flex items-center gap-2 px-4 py-2 rounded-lg transition bg-purple-600 hover:bg-purple-700"
                >
                  <Library className="w-4 h-4" />
                  Explorar
                </button>
                <button
                  onClick={() => setShowMenu(true)}
                  className="flex items-center gap-2 bg-gray-800 hover:bg-gray-700 px-4 py-2 rounded-lg transition"
                >
                  <Menu className="w-4 h-4" />
                  Menú
                </button>
                {!isAdmin ? (
                  <button
                    onClick={() => setShowLoginModal(true)}
                    className="flex items-center gap-2 bg-gray-800 hover:bg-gray-700 px-4 py-2 rounded-lg transition"
                  >
                    <Lock className="w-4 h-4" />
                    Admin
                  </button>
                ) : (
                  <button
                    onClick={() => setIsAdmin(false)}
                    className="flex items-center gap-2 bg-red-600 hover:bg-red-700 px-4 py-2 rounded-lg transition"
                  >
                    <LogOut className="w-4 h-4" />
                    Salir
                  </button>
                )}
              </div>

              <div className="flex md:hidden items-center gap-2">
                <button
                  onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
                  className="p-2 rounded-lg transition bg-purple-600"
                >
                  <Library className="w-5 h-5" />
                </button>
                <button
                  onClick={() => setShowMenu(true)}
                  className="p-2 bg-gray-800 rounded-lg"
                >
                  <Menu className="w-5 h-5" />
                </button>
              </div>
            </div>
          </div>
        </nav>

        {showMenu && (
          <div className="fixed inset-0 z-50">
            <div className="absolute inset-0 bg-black bg-opacity-70" onClick={() => setShowMenu(false)}></div>
            <div className="absolute right-0 top-0 h-full w-80 max-w-full bg-gray-900 border-l border-gray-800 p-6 overflow-y-auto">
              <div className="flex justify-between items-center mb-8">
                <h2 className="text-2xl font-bold">Menú</h2>
                <button onClick={() => setShowMenu(false)} className="p-2 hover:bg-gray-800 rounded-lg">
                  <X className="w-6 h-6" />
                </button>
              </div>

              <div className="space-y-6">
                <div className="bg-gray-800 rounded-lg p-6">
                  <h3 className="text-lg font-bold mb-3 flex items-center gap-2">
                    <BookOpen className="w-5 h-5 text-purple-400" />
                    Contenido Disponible
                  </h3>
                  <div className="space-y-2 text-gray-300">
                    <p className="flex items-center gap-2">
                      <span className="w-2 h-2 bg-purple-500 rounded-full"></span>
                      Libros
                    </p>
                    <p className="flex items-center gap-2">
                      <span className="w-2 h-2 bg-pink-500 rounded-full"></span>
                      Novelas
                    </p>
                    <p className="flex items-center gap-2">
                      <span className="w-2 h-2 bg-blue-500 rounded-full"></span>
                      Documentos
                    </p>
                  </div>
                </div>

                <div className="bg-gray-800 rounded-lg p-6">
                  <h3 className="text-lg font-bold mb-3">Acerca de</h3>
                  <p className="text-gray-300 text-sm leading-relaxed">
                    El Rincón Del Funado es una plataforma para compartir y descubrir contenido literario de manera gratuita y accesible.
                  </p>
                </div>

                {!isAdmin ? (
                  <button
                    onClick={() => {
                      setShowMenu(false);
                      setShowLoginModal(true);
                    }}
                    className="w-full flex items-center justify-center gap-2 bg-purple-600 hover:bg-purple-700 py-3 rounded-lg transition"
                  >
                    <Lock className="w-4 h-4" />
                    Acceso Admin
                  </button>
                ) : (
                  <button
                    onClick={() => {
                      setIsAdmin(false);
                      setShowMenu(false);
                    }}
                    className="w-full flex items-center justify-center gap-2 bg-red-600 hover:bg-red-700 py-3 rounded-lg transition"
                  >
                    <LogOut className="w-4 h-4" />
                    Cerrar Sesión
                  </button>
                )}

                <div className="text-center text-gray-500 text-sm pt-4 border-t border-gray-800">
                  <p>Total de documentos: {documents.length}</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {showLoginModal && (
          <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50 p-4">
            <div className="bg-gray-900 rounded-lg p-8 max-w-md w-full border border-gray-800">
              <div className="flex items-center justify-center mb-6">
                <div className="bg-purple-600 p-3 rounded-full">
                  <Lock className="w-8 h-8" />
                </div>
              </div>
              <h2 className="text-2xl font-bold text-center mb-6">Acceso Administrativo</h2>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleLogin()}
                placeholder="Contraseña"
                className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg focus:outline-none focus:border-purple-500 mb-4"
              />
              <div className="flex gap-3">
                <button
                  onClick={handleLogin}
                  className="flex-1 bg-gradient-to-r from-purple-600 to-pink-600 py-3 rounded-lg font-semibold hover:from-purple-700 hover:to-pink-700 transition"
                >
                  Ingresar
                </button>
                <button
                  onClick={() => setShowLoginModal(false)}
                  className="flex-1 bg-gray-800 py-3 rounded-lg font-semibold hover:bg-gray-700 transition"
                >
                  Cancelar
                </button>
              </div>
            </div>
          </div>
        )}

        <div className="container mx-auto px-4 py-8">
          <div className="max-w-2xl mx-auto mb-8">
            <div className="relative">
              <Search className="absolute left-4 top-3.5 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Buscar libros y novelas..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-12 pr-4 py-3 bg-gray-900 bg-opacity-80 backdrop-blur-lg border border-gray-800 rounded-lg focus:outline-none focus:border-purple-500"
              />
            </div>
          </div>

          {isAdmin && (
            <div className="text-center mb-8">
              <button
                onClick={() => setShowUploadModal(true)}
                className="inline-flex items-center gap-2 bg-gradient-to-r from-purple-600 to-pink-600 px-6 py-3 rounded-lg font-semibold hover:from-purple-700 hover:to-pink-700 transition shadow-lg"
              >
                <Upload className="w-5 h-5" />
                Subir Documento
              </button>
            </div>
          )}

          {showUploadModal && (
            <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50 p-4">
              <div className="bg-gray-900 rounded-lg p-8 max-w-md w-full border border-gray-800">
                <h3 className="text-2xl font-bold mb-6">Nuevo Documento</h3>
                <input
                  type="text"
                  placeholder="Título del documento"
                  value={newDoc.title}
                  onChange={(e) => setNewDoc({ ...newDoc, title: e.target.value })}
                  className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg focus:outline-none focus:border-purple-500 mb-4"
                />
                <input
                  type="text"
                  placeholder="Edad mínima (ej: 18+)"
                  value={newDoc.ageRestriction}
                  onChange={(e) => setNewDoc({ ...newDoc, ageRestriction: e.target.value })}
                  className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg focus:outline-none focus:border-purple-500 mb-4"
                />
                <input
                  type="file"
                  accept=".pdf"
                  onChange={handleFileChange}
                  className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg focus:outline-none focus:border-purple-500 mb-6 text-sm"
                />
                <div className="flex gap-3">
                  <button
                    onClick={handleUpload}
                    className="flex-1 bg-gradient-to-r from-purple-600 to-pink-600 py-3 rounded-lg font-semibold hover:from-purple-700 hover:to-pink-700 transition"
                  >
                    Subir
                  </button>
                  <button
                    onClick={() => setShowUploadModal(false)}
                    className="flex-1 bg-gray-800 py-3 rounded-lg font-semibold hover:bg-gray-700 transition"
                  >
                    Cancelar
                  </button>
                </div>
              </div>
            </div>
          )}

          <div className="max-w-6xl mx-auto">
            {loading ? (
              <div className="text-center text-gray-400 py-12">
                <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-gray-700 border-t-purple-600"></div>
                <p className="mt-4">Cargando documentos...</p>
              </div>
            ) : filteredDocs.length === 0 ? (
              <div className="text-center text-gray-400 py-12">
                <BookOpen className="w-16 h-16 mx-auto mb-4 opacity-50" />
                <p className="text-xl">{searchTerm ? 'No se encontraron documentos' : 'No hay documentos subidos aún'}</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredDocs.map(doc => (
                  <div key={doc.id} className="bg-gray-900 bg-opacity-80 backdrop-blur-lg rounded-lg overflow-hidden border border-gray-800 hover:border-purple-500 transition hover:shadow-xl hover:shadow-purple-500/20">
                    <div className="p-6">
                      <div className="flex items-start gap-3 mb-4">
                        <div className="bg-gradient-to-br from-purple-500 to-pink-500 p-2 rounded-lg flex-shrink-0">
                          <BookOpen className="w-5 h-5" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <h3 className="text-lg font-bold mb-2 line-clamp-2">{doc.title}</h3>
                          <div className="flex flex-wrap gap-2 text-xs">
                            <span className="bg-gray-800 px-2 py-1 rounded text-gray-400">📅 {doc.uploadDate}</span>
                            <span className="bg-red-600 px-2 py-1 rounded text-white">{doc.ageRestriction}</span>
                          </div>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <a
                          href={doc.fileUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex-1 flex items-center justify-center gap-2 bg-purple-600 py-2 rounded-lg hover:bg-purple-700 transition text-sm"
                        >
                          <Eye className="w-4 h-4" />
                          Ver
                        </a>
                        <a
                          href={doc.fileUrl}
                          download={doc.title + '.pdf'}
                          className="flex-1 flex items-center justify-center gap-2 bg-blue-600 py-2 rounded-lg hover:bg-blue-700 transition text-sm"
                        >
                          <Download className="w-4 h-4" />
                          Descargar
                        </a>
                        {isAdmin && (
                          <button
                            onClick={() => handleDelete(doc.id)}
                            className="p-2 bg-red-600 hover:bg-red-700 rounded-lg transition"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
