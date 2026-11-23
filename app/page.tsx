'use client'

import { useEffect, useState } from "react";
import { WeatherData } from "@/types/weather";
import { Favorite } from "@/types/favorite";
import { WeatherSearch, getFavorites, addFavorite, updateFavorite, deleteFavorite } from "@/actions";
import { Container, Button, Form, Card, ListGroup } from "react-bootstrap";
import 'bootstrap/dist/css/bootstrap.min.css';

export default function Home() {
  const [error, setError] = useState<string>("");
  const [weather, setWeather] = useState<WeatherData | null>(null);
  const [favorites, setFavorites] = useState<Favorite[]>([]);
  const [newNote, setNewNote] = useState("");
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editNote, setEditNote] = useState("");

  useEffect(() => {
    getFavorites().then(setFavorites);
  }, []);

  const reload = async () => setFavorites(await getFavorites());

  const searchCity = async (city: string) => {
    setError("");
    const { data, error: weatherError } = await WeatherSearch(city);

    if (weatherError) {
      setError(weatherError);
      setWeather(null);
    }
    if (data) {
      setWeather(data);
    }
  };

  const WeatherSearchData = async (formData: FormData) => {
    await searchCity(formData.get("city")?.toString() || "");
  };

  const handleSave = async () => {
    if (!weather) return;
    const { error: e } = await addFavorite(weather.name, newNote);
    setError(e || "");
    if (!e) setNewNote("");
    await reload();
  };

  const handleUpdate = async (id: number) => {
    const { error: e } = await updateFavorite(id, editNote);
    setError(e || "");
    setEditingId(null);
    await reload();
  };

  const handleDelete = async (id: number) => {
    if (!window.confirm("Hapus kota ini dari favorit?")) return;
    const { error: e } = await deleteFavorite(id);
    setError(e || "");
    await reload();
  };

  return (
    <Container fluid className="d-flex flex-column align-items-center justify-content-center min-vh-100 py-5" style={{ backgroundColor: "#4d91f0" }}>

      {/* Form */}
      <Form action={WeatherSearchData} className="d-flex flex-column align-items-center p-4 rounded" style={{ backgroundColor: "white", width: "300px" }}>
        <Form.Group className="mb-3 text-center">
          <Form.Label>Input City Name</Form.Label>
          <Form.Control type="text" placeholder="Enter city name" className="mb-3" name="city" />
        </Form.Group>

        <Button type="submit" variant="primary" className="w-100"> Get Weather </Button>
      </Form>

      {/* Error Message */}
      {error && (
        <p className="text-danger mt-3 text-center bg-white px-3 py-1 rounded">{error}</p>
      )}

      {/* Weather Card */}
      {weather && (
        <Card className="mt-4" style={{ width: "18rem" }}>
          <Card.Body>
            <Card.Title>{weather.name}</Card.Title>

            <Card.Subtitle className="mb-2 text-muted">
              {weather.weather[0].main}
            </Card.Subtitle>

            <Card.Text>
              Temperature: {weather.main.temp}°C<br />
              Feels Like: {weather.main.feels_like}°C<br />
              Humidity: {weather.main.humidity}%<br />
              Wind Speed: {weather.wind.speed} m/s<br />
              Description: {weather.weather[0].description}<br />

              <img
                src={`https://openweathermap.org/img/wn/${weather.weather[0].icon}.png`}
                alt="Weather Icon"
              />
            </Card.Text>

            <Form.Control
              size="sm"
              className="mb-2"
              placeholder="Catatan (opsional)"
              value={newNote}
              onChange={(e) => setNewNote(e.target.value)}
            />
            <Button variant="success" size="sm" className="w-100" onClick={handleSave}>
              Simpan ke Favorit
            </Button>
          </Card.Body>
        </Card>
      )}

      {/* Favorite Cities (CRUD) */}
      <Card className="mt-4" style={{ width: "22rem" }}>
        <Card.Header>Kota Favorit</Card.Header>
        <ListGroup variant="flush">
          {favorites.length === 0 && (
            <ListGroup.Item className="text-muted">Belum ada kota favorit.</ListGroup.Item>
          )}

          {favorites.map((fav) => (
            <ListGroup.Item key={fav.id}>
              <div className="d-flex justify-content-between align-items-center">
                <Button variant="link" className="p-0 fw-bold" onClick={() => searchCity(fav.city)}>
                  {fav.city}
                </Button>
                <div>
                  <Button
                    size="sm"
                    variant="outline-secondary"
                    className="me-2"
                    onClick={() => { setEditingId(fav.id); setEditNote(fav.note); }}
                  >
                    Ubah
                  </Button>
                  <Button size="sm" variant="outline-danger" onClick={() => handleDelete(fav.id)}>
                    Hapus
                  </Button>
                </div>
              </div>

              {editingId === fav.id ? (
                <div className="d-flex gap-2 mt-2">
                  <Form.Control
                    size="sm"
                    placeholder="Catatan"
                    value={editNote}
                    onChange={(e) => setEditNote(e.target.value)}
                  />
                  <Button size="sm" onClick={() => handleUpdate(fav.id)}>Simpan</Button>
                  <Button size="sm" variant="secondary" onClick={() => setEditingId(null)}>Batal</Button>
                </div>
              ) : (
                <small className="text-muted">{fav.note || "Tanpa catatan"}</small>
              )}
            </ListGroup.Item>
          ))}
        </ListGroup>
      </Card>

    </Container>
  );
}