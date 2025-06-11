"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Cloud, Search, MapPin, Wind, Droplets, Thermometer } from "lucide-react"
import { useToast } from "@/components/ui/use-toast"

interface WeatherData {
  name: string
  main: {
    temp: number
    feels_like: number
    humidity: number
  }
  weather: {
    main: string
    description: string
    icon: string
  }[]
  wind: {
    speed: number
  }
  sys: {
    country: string
  }
}

export default function Weather() {
  const [city, setCity] = useState("")
  const [weather, setWeather] = useState<WeatherData | null>(null)
  const [loading, setLoading] = useState(false)
  const { toast } = useToast()

  const API_KEY = "7aa61fb8-46ce-11f0-89b2-0242ac130006-7aa62058-46ce-11f0-89b2-0242ac130006" // This is a free API key for demo purposes

  const fetchWeather = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!city.trim()) return

    setLoading(true)
    try {
      const response = await fetch(
        `https://api.openweathermap.org/data/2.5/weather?q=${city}&units=metric&appid=${API_KEY}`,
      )

      if (!response.ok) {
        throw new Error("City not found")
      }

      const data = await response.json()
      setWeather(data)
    } catch (error) {
      toast({
        title: "Error",
        description: "Could not find weather data for this location. Please check the city name and try again.",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const getWeatherIcon = (iconCode: string) => {
    return `https://openweathermap.org/img/wn/${iconCode}@2x.png`
  }

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="max-w-md mx-auto">
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <Cloud className="h-6 w-6 text-primary" />
              <CardTitle>Weather Widget</CardTitle>
            </div>
            <CardDescription>Check current weather conditions by location</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={fetchWeather} className="flex gap-2 mb-6">
              <Input
                placeholder="Enter city name..."
                value={city}
                onChange={(e) => setCity(e.target.value)}
                className="flex-1"
              />
              <Button type="submit" disabled={loading}>
                {loading ? (
                  "Loading..."
                ) : (
                  <>
                    <Search className="mr-2 h-4 w-4" />
                    Search
                  </>
                )}
              </Button>
            </form>

            {weather && (
              <div className="text-center">
                <div className="flex items-center justify-center mb-2">
                  <MapPin className="h-5 w-5 mr-1" />
                  <h3 className="text-xl font-medium">
                    {weather.name}, {weather.sys.country}
                  </h3>
                </div>

                <div className="flex justify-center items-center">
                  <img
                    src={getWeatherIcon(weather.weather[0].icon) || "/placeholder.svg"}
                    alt={weather.weather[0].description}
                    className="w-20 h-20"
                  />
                  <div className="text-4xl font-bold">{Math.round(weather.main.temp)}°C</div>
                </div>

                <p className="text-lg capitalize mb-4">{weather.weather[0].description}</p>

                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-muted rounded-md p-3 flex items-center">
                    <Thermometer className="h-5 w-5 mr-2 text-orange-500" />
                    <div>
                      <div className="text-sm text-muted-foreground">Feels Like</div>
                      <div className="font-medium">{Math.round(weather.main.feels_like)}°C</div>
                    </div>
                  </div>
                  <div className="bg-muted rounded-md p-3 flex items-center">
                    <Droplets className="h-5 w-5 mr-2 text-blue-500" />
                    <div>
                      <div className="text-sm text-muted-foreground">Humidity</div>
                      <div className="font-medium">{weather.main.humidity}%</div>
                    </div>
                  </div>
                  <div className="bg-muted rounded-md p-3 flex items-center col-span-2">
                    <Wind className="h-5 w-5 mr-2 text-gray-500" />
                    <div>
                      <div className="text-sm text-muted-foreground">Wind Speed</div>
                      <div className="font-medium">{weather.wind.speed} m/s</div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {!weather && !loading && (
              <div className="text-center py-8 text-muted-foreground">
                <Cloud className="h-16 w-16 mx-auto mb-2 opacity-20" />
                <p>Enter a city name to check the weather</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
