import { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { toast } from '@/hooks/use-toast';
import { CloudRain, CloudSun, Cloud, CloudSnow, Wind, Thermometer } from 'lucide-react';

interface WeatherData {
  name: string;
  main: {
    temp: number;
    feels_like: number;
    humidity: number;
    pressure: number;
  };
  weather: {
    main: string;
    description: string;
    icon: string;
  }[];
  wind: {
    speed: number;
  };
  sys: {
    country: string;
  };
}

const API_KEY = '2c6e5e6a8e8a4c5c4e5c6c5c8e8a4c5c'; // Demo API key - users should get their own from OpenWeatherMap

export default function WeatherApp() {
  const [weatherData, setWeatherData] = useState<WeatherData | null>(null);
  const [location, setLocation] = useState('');
  const [loading, setLoading] = useState(false);
  const [currentLocationLoading, setCurrentLocationLoading] = useState(false);

  const getWeatherByLocation = async (lat: number, lon: number) => {
    try {
      setLoading(true);
      const response = await fetch(
        `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${API_KEY}&units=metric`
      );
      
      if (!response.ok) {
        throw new Error('Weather data not found');
      }
      
      const data = await response.json();
      setWeatherData(data);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to fetch weather data. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const getWeatherByCity = async (cityName: string) => {
    try {
      setLoading(true);
      const response = await fetch(
        `https://api.openweathermap.org/data/2.5/weather?q=${cityName}&appid=${API_KEY}&units=metric`
      );
      
      if (!response.ok) {
        throw new Error('City not found');
      }
      
      const data = await response.json();
      setWeatherData(data);
    } catch (error) {
      toast({
        title: "Error",
        description: "City not found. Please check the spelling and try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const getCurrentLocation = () => {
    if (!navigator.geolocation) {
      toast({
        title: "Error",
        description: "Geolocation is not supported by this browser.",
        variant: "destructive",
      });
      return;
    }

    setCurrentLocationLoading(true);
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        getWeatherByLocation(latitude, longitude);
        setCurrentLocationLoading(false);
      },
      (error) => {
        toast({
          title: "Location Error",
          description: "Unable to retrieve your location. Please search for a city instead.",
          variant: "destructive",
        });
        setCurrentLocationLoading(false);
      }
    );
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (location.trim()) {
      getWeatherByCity(location.trim());
    }
  };

  const getWeatherIcon = (weatherMain: string) => {
    switch (weatherMain.toLowerCase()) {
      case 'clear':
        return <CloudSun className="h-16 w-16 text-accent" />;
      case 'clouds':
        return <Cloud className="h-16 w-16 text-muted-foreground" />;
      case 'rain':
      case 'drizzle':
        return <CloudRain className="h-16 w-16 text-primary" />;
      case 'snow':
        return <CloudSnow className="h-16 w-16 text-primary" />;
      default:
        return <CloudSun className="h-16 w-16 text-accent" />;
    }
  };

  const getBackgroundGradient = (weatherMain: string) => {
    switch (weatherMain.toLowerCase()) {
      case 'clear':
        return 'bg-sunny-gradient';
      case 'clouds':
        return 'bg-cloud-gradient';
      case 'rain':
      case 'drizzle':
      case 'snow':
        return 'bg-sky-gradient';
      default:
        return 'bg-sky-gradient';
    }
  };

  useEffect(() => {
    // Load default location on component mount
    getCurrentLocation();
  }, []);

  return (
    <div className={`min-h-screen transition-all duration-1000 ${weatherData ? getBackgroundGradient(weatherData.weather[0].main) : 'bg-sky-gradient'}`}>
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-2xl mx-auto">
          {/* Header */}
          <div className="text-center mb-8 animate-fade-in">
            <h1 className="text-4xl font-bold text-foreground mb-2">Weather App</h1>
            <p className="text-muted-foreground">Get current weather conditions for any location</p>
          </div>

          {/* Search Form */}
          <Card className="p-6 backdrop-blur-sm bg-white/80 border-0 shadow-lg mb-8 animate-slide-up">
            <form onSubmit={handleSearch} className="flex gap-4">
              <Input
                type="text"
                placeholder="Enter city name..."
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                className="flex-1"
              />
              <Button type="submit" disabled={loading} className="px-6">
                Search
              </Button>
              <Button
                type="button"
                variant="secondary"
                onClick={getCurrentLocation}
                disabled={currentLocationLoading}
                className="px-6"
              >
                {currentLocationLoading ? 'Locating...' : 'My Location'}
              </Button>
            </form>
          </Card>

          {/* Weather Display */}
          {loading && (
            <Card className="p-8 backdrop-blur-sm bg-white/80 border-0 shadow-lg animate-fade-in">
              <div className="text-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
                <p className="text-muted-foreground">Loading weather data...</p>
              </div>
            </Card>
          )}

          {weatherData && !loading && (
            <div className="space-y-6 animate-fade-in">
              {/* Main Weather Card */}
              <Card className="p-8 backdrop-blur-sm bg-white/80 border-0 shadow-lg">
                <div className="text-center">
                  <h2 className="text-2xl font-semibold mb-2">
                    {weatherData.name}, {weatherData.sys.country}
                  </h2>
                  <div className="flex items-center justify-center mb-4">
                    {getWeatherIcon(weatherData.weather[0].main)}
                  </div>
                  <div className="text-6xl font-bold text-foreground mb-2">
                    {Math.round(weatherData.main.temp)}°C
                  </div>
                  <p className="text-xl text-muted-foreground capitalize mb-4">
                    {weatherData.weather[0].description}
                  </p>
                  <p className="text-muted-foreground">
                    Feels like {Math.round(weatherData.main.feels_like)}°C
                  </p>
                </div>
              </Card>

              {/* Weather Details */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <Card className="p-6 backdrop-blur-sm bg-white/80 border-0 shadow-lg">
                  <div className="flex items-center space-x-3">
                    <Wind className="h-8 w-8 text-primary" />
                    <div>
                      <p className="text-sm text-muted-foreground">Wind Speed</p>
                      <p className="text-2xl font-semibold">{weatherData.wind.speed} m/s</p>
                    </div>
                  </div>
                </Card>

                <Card className="p-6 backdrop-blur-sm bg-white/80 border-0 shadow-lg">
                  <div className="flex items-center space-x-3">
                    <Thermometer className="h-8 w-8 text-primary" />
                    <div>
                      <p className="text-sm text-muted-foreground">Humidity</p>
                      <p className="text-2xl font-semibold">{weatherData.main.humidity}%</p>
                    </div>
                  </div>
                </Card>

                <Card className="p-6 backdrop-blur-sm bg-white/80 border-0 shadow-lg">
                  <div className="flex items-center space-x-3">
                    <Cloud className="h-8 w-8 text-primary" />
                    <div>
                      <p className="text-sm text-muted-foreground">Pressure</p>
                      <p className="text-2xl font-semibold">{weatherData.main.pressure} hPa</p>
                    </div>
                  </div>
                </Card>
              </div>
            </div>
          )}

          {!weatherData && !loading && (
            <Card className="p-8 backdrop-blur-sm bg-white/80 border-0 shadow-lg text-center animate-fade-in">
              <CloudSun className="h-16 w-16 text-accent mx-auto mb-4" />
              <h3 className="text-xl font-semibold mb-2">Welcome to Weather App</h3>
              <p className="text-muted-foreground">
                Search for a city or use your current location to get started.
              </p>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}