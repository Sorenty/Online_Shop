import React, { useEffect, useState } from 'react';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';

export default function AdminPanel() {
  const { role } = useAuth();
  const [products, setProducts] = useState([]);
  const [editing, setEditing] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/products').then(r => {
      setProducts(r.data);
      setLoading(false);
    }).catch(e => {
      console.error(e);
      setLoading(false);
    });
  }, []);

  if (role !== 'ROLE_ADMIN') {
    return <div>Доступно только для админа (нужен токен admin)</div>;
  }

  function startEdit(p) {
    setEditing({ ...p });
  }

  function cancelEdit() {
    setEditing(null);
  }

  async function saveEdit() {
    try {
      const res = await api.put(`/products/${editing.id}`, editing);
      setProducts(prev => prev.map(p => p.id === editing.id ? res.data : p));
      setEditing(null);
    } catch (err) {
      console.error(err);
      alert('Ошибка при сохранении');
    }
  }

  async function createNew() {
    const name = prompt('Название товара');
    if (!name) return;
    const desc = prompt('Описание') || '';
    const price = parseFloat(prompt('Цена', '0') || '0');
    const stock = parseInt(prompt('Количество', '0') || '0', 10);
    try {
      const res = await api.post('/products', { name, description: desc, price, stock });
      setProducts(prev => [...prev, res.data]);
    } catch (err) {
      console.error(err);
      alert('Ошибка при создании');
    }
  }

  async function deleteProduct(id) {
    if (!window.confirm('Удалить товар?')) return;
    try {
      await api.delete(`/products/${id}`);
      setProducts(prev => prev.filter(p => p.id !== id));
    } catch (err) {
      console.error(err);
      alert('Ошибка при удалении');
    }
  }

  if (loading) return <div>Загрузка...</div>;

  return (
    <div>
      <h2>Админ-панель</h2>
      <button onClick={createNew}>Добавить товар</button>
      <div style={{ marginTop: 12 }}>
        {products.map(p => (
          <div key={p.id} style={{ border: '1px solid #eee', padding: 8, marginBottom: 8 }}>
            {editing && editing.id === p.id ? (
              <>
                <input value={editing.name} onChange={e => setEditing({ ...editing, name: e.target.value })} />
                <input value={editing.description} onChange={e => setEditing({ ...editing, description: e.target.value })} />
                <input type="number" value={editing.price} onChange={e => setEditing({ ...editing, price: parseFloat(e.target.value) })} />
                <input type="number" value={editing.stock} onChange={e => setEditing({ ...editing, stock: parseInt(e.target.value, 10) })} />
                <button onClick={saveEdit}>Сохранить</button>
                <button onClick={cancelEdit}>Отмена</button>
              </>
            ) : (
              <>
                <div><strong>{p.name}</strong></div>
                <div>{p.description}</div>
                <div>Цена: {p.price} ₽</div>
                <div>В наличии: {p.stock}</div>
                <div style={{ marginTop: 6 }}>
                  <button onClick={() => startEdit(p)}>Изменить</button>
                  <button onClick={() => deleteProduct(p.id)} style={{ marginLeft: 8 }}>Удалить</button>
                </div>
              </>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
