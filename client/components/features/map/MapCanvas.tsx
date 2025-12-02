'use client';

import { useEffect, useRef, useState } from 'react';
import { motion } from 'framer-motion';
import * as d3 from 'd3';
import { geoPath, geoMercator } from 'd3-geo';
import { feature } from 'topojson-client';
import { useRouter } from 'next/navigation';
import { countryService } from '@/lib/services';
import type { CountryListData } from '@/types';

interface MapCanvasProps {
  selectedCountry: string | null;
  filters?: {
    region?: string;
    difficulty_min?: number;
    difficulty_max?: number;
    search?: string;
  };
}

export default function MapCanvas({ selectedCountry, filters }: MapCanvasProps) {
  const svgRef = useRef<SVGSVGElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const router = useRouter();
  const [tooltip, setTooltip] = useState<{ x: number; y: number; content: string } | null>(null);
  const zoomRef = useRef<any>(null);
  const [dimensions, setDimensions] = useState({ width: 0, height: 0 });
  const [countriesData, setCountriesData] = useState<CountryListData[]>([]);
  const [loading, setLoading] = useState(true);

  // Fetch countries data from API
  useEffect(() => {
    const fetchCountries = async () => {
      try {
        setLoading(true);
        const params: any = {};
        
        if (filters?.region) {
          params.region = filters.region;
        }
        
        if (filters?.difficulty_min !== undefined) {
          params.difficulty_score__gte = filters.difficulty_min;
        }
        
        if (filters?.difficulty_max !== undefined) {
          params.difficulty_score__lte = filters.difficulty_max;
        }
        
        if (filters?.search) {
          params.search = filters.search;
        }
        
        const response = await countryService.getAll(params);
        // Handle both paginated and direct array responses
        const data = response.results || response;
        const countriesArray = Array.isArray(data) ? data : [];
        console.log(`Loaded ${countriesArray.length} countries from API`, countriesArray.map(c => c.code));
        setCountriesData(countriesArray);
        setLoading(false);
      } catch (error) {
        console.error('Error fetching countries:', error);
        setLoading(false);
      }
    };

    fetchCountries();
  }, [filters]);

  // Handle window resize
  useEffect(() => {
    const handleResize = () => {
      if (containerRef.current) {
        setDimensions({
          width: containerRef.current.clientWidth,
          height: containerRef.current.clientHeight,
        });
      }
    };

    // Initial size
    handleResize();

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    if (!svgRef.current || !containerRef.current || dimensions.width === 0 || loading) return;

    const width = dimensions.width;
    const height = dimensions.height;

    // Clear existing SVG completely
    const svg = d3.select(svgRef.current);
    svg.selectAll('*').remove();

    // Set SVG dimensions
    svg
      .attr('width', width)
      .attr('height', height)
      .attr('viewBox', `0 0 ${width} ${height}`)
      .style('display', 'block');

    // Create projection with proper centering and smaller scale to show more of the world
    const projection = geoMercator()
      .scale(width / 7)  // Reduced scale to show more of the map
      .center([0, 20])   // Center slightly north to better show landmasses
      .translate([width / 2, height / 2]);

    const path = geoPath().projection(projection);

    // Create a map of country codes to data
    const countryDataMap = new Map(
      countriesData.map(c => [c.code.toUpperCase(), c])
    );

    // Load world topology
    fetch('https://cdn.jsdelivr.net/npm/world-atlas@2/countries-110m.json')
      .then(response => response.json())
      .then((worldData: any) => {
        const countries: any = feature(worldData, worldData.objects.countries);

        // Color scale for difficulty
        const colorScale = d3.scaleLinear<string>()
          .domain([1, 10])
          .range(['#E8F4F8', '#2C4A6B']); // CSS variables don't work in D3

        // Create container for zoom
        const g = svg.append('g');

        // Draw countries
        g.selectAll('path')
          .data(countries.features)
          .join('path')
          .attr('d', path as any)
          .attr('fill', (d: any) => {
            // Get country data by ISO code (id is numeric ISO code in world-atlas)
            const isoCode = getISOCodeFromId(d.id);
            const countryData = countryDataMap.get(isoCode);
            
            if (countryData && countryData.difficulty_score) {
              return colorScale(countryData.difficulty_score);
            }
            return '#E0E0E0'; // Gray for countries without data
          })
          .attr('stroke', '#ffffff')
          .attr('stroke-width', 0.5)
          .attr('class', 'country')
          .style('cursor', (d: any) => {
            const isoCode = getISOCodeFromId(d.id);
            return countryDataMap.has(isoCode) ? 'pointer' : 'default';
          })
          .style('transition', 'all 0.2s ease')
          .on('mouseover', function(event, d: any) {
            const isoCode = getISOCodeFromId(d.id);
            const countryData = countryDataMap.get(isoCode);
            
            if (countryData) {
              d3.select(this)
                .attr('fill', '#FF6B35')
                .attr('stroke-width', 1.5);

              const difficulty = countryData.difficulty_score || 0;
              const difficultyLabel = difficulty <= 3 ? 'Easy' : difficulty <= 6 ? 'Medium' : 'Hard';

              setTooltip({
                x: event.clientX,
                y: event.clientY,
                content: `${countryData.name} - ${difficultyLabel}`
              });
            }
          })
          .on('mousemove', function(event, d: any) {
            const isoCode = getISOCodeFromId(d.id);
            const countryData = countryDataMap.get(isoCode);
            
            if (countryData) {
              const difficulty = countryData.difficulty_score || 0;
              const difficultyLabel = difficulty <= 3 ? 'Easy' : difficulty <= 6 ? 'Medium' : 'Hard';
              
              setTooltip({
                x: event.clientX,
                y: event.clientY,
                content: `${countryData.name} - ${difficultyLabel}`
              });
            }
          })
          .on('mouseout', function(event, d: any) {
            const isoCode = getISOCodeFromId(d.id);
            const countryData = countryDataMap.get(isoCode);
            
            if (countryData) {
              d3.select(this)
                .attr('fill', countryData.difficulty_score ? colorScale(countryData.difficulty_score) : '#E0E0E0')
                .attr('stroke-width', 0.5);
            }

            setTooltip(null);
          })
          .on('click', function(event, d: any) {
            const isoCode = getISOCodeFromId(d.id);
            const countryData = countryDataMap.get(isoCode);
            
            if (countryData) {
              router.push(`/explore?country=${countryData.code.toLowerCase()}`);
            }
          });

        // Add zoom behavior - allow zooming out to see full world
        const zoom = d3.zoom()
          .scaleExtent([0.5, 8])  // Allow zoom out to 0.5x
          .on('zoom', (event) => {
            g.attr('transform', event.transform);
          });

        // Store zoom reference for cleanup
        zoomRef.current = zoom;

        svg.call(zoom as any);

        // Zoom to selected country if one is selected
        if (selectedCountry) {
          const selectedCode = selectedCountry.toUpperCase();
          const selectedFeature = countries.features.find((f: any) => {
            const isoCode = getISOCodeFromId(f.id);
            return isoCode === selectedCode;
          });

          if (selectedFeature) {
            const bounds = path.bounds(selectedFeature);
            const dx = bounds[1][0] - bounds[0][0];
            const dy = bounds[1][1] - bounds[0][1];
            const x = (bounds[0][0] + bounds[1][0]) / 2;
            const y = (bounds[0][1] + bounds[1][1]) / 2;
            const scale = Math.min(8, 0.9 / Math.max(dx / width, dy / height));
            const translate = [width / 2 - scale * x, height / 2 - scale * y];

            svg.transition()
              .duration(750)
              .call(
                zoom.transform as any,
                d3.zoomIdentity.translate(translate[0], translate[1]).scale(scale)
              );

            // Dim other countries and highlight selected
            g.selectAll('path')
              .transition()
              .duration(300)
              .style('opacity', (d: any) => {
                const isoCode = getISOCodeFromId(d.id);
                return isoCode === selectedCode ? 1 : 0.3;
              })
              .attr('stroke-width', (d: any) => {
                const isoCode = getISOCodeFromId(d.id);
                return isoCode === selectedCode ? 2 : 0.5;
              });
          }
        } else {
          // Reset opacity and stroke when no country selected
          g.selectAll('path')
            .style('opacity', 1)
            .attr('stroke-width', 0.5);
        }
      })
      .catch(error => {
        console.error('Error loading map data:', error);
      });

    // Cleanup function
    return () => {
      if (svgRef.current) {
        const svg = d3.select(svgRef.current);
        // Remove zoom behavior
        svg.on('.zoom', null);
        // Clear all elements
        svg.selectAll('*').remove();
      }
    };
  }, [selectedCountry, router, dimensions, countriesData, loading]);

  // Helper function to map numeric ISO codes to alpha-3 codes
  const getISOCodeFromId = (numericId: number): string => {
    const isoMap: Record<string, string> = {
      '124': 'CAN', // Canada
      '036': 'AUS', // Australia
      '826': 'GBR', // United Kingdom
      '276': 'DEU', // Germany
      '840': 'USA', // United States
      '554': 'NZL', // New Zealand
      '372': 'IRL', // Ireland
      '528': 'NLD', // Netherlands
      '752': 'SWE', // Sweden
      '702': 'SGP', // Singapore
      '484': 'MEX', // Mexico
      '250': 'FRA', // France
      '578': 'NOR', // Norway
      '208': 'DNK', // Denmark
      '724': 'ESP', // Spain
      '380': 'ITA', // Italy
      '620': 'PRT', // Portugal
      '616': 'POL', // Poland
      '203': 'CZE', // Czech Republic
      '040': 'AUT', // Austria
      '756': 'CHE', // Switzerland
      '392': 'JPN', // Japan
      '410': 'KOR', // South Korea
      '344': 'HKG', // Hong Kong
      '784': 'ARE', // United Arab Emirates
      '764': 'THA', // Thailand
      '458': 'MYS', // Malaysia
      '704': 'VNM', // Vietnam
      '076': 'BRA', // Brazil
      '032': 'ARG', // Argentina
      '152': 'CHL', // Chile
      '170': 'COL', // Colombia
      '710': 'ZAF', // South Africa
    };
    return isoMap[String(numericId)] || '';
  };

  return (
    <>
      <motion.div
        ref={containerRef}
        className={`absolute inset-0 transition-all duration-300 ${
          selectedCountry ? 'blur-sm opacity-60' : ''
        }`}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5 }}
      >
        <svg 
          ref={svgRef} 
          className="w-full h-full bg-bg-primary dark:bg-dark-bg-primary" 
          style={{ display: 'block' }}
        />
        
        {/* Countries Count Badge */}
        {!loading && countriesData.length > 0 && (
          <motion.div
            className="absolute top-6 left-1/2 -translate-x-1/2 px-4 py-2 glass rounded-full shadow-float"
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            <div className="text-sm font-medium text-center">
              <span className="text-[var(--accent-primary)]">{countriesData.length}</span>
              <span className="text-white/70 ml-1">
                {countriesData.length === 1 ? 'country' : 'countries'} available
              </span>
            </div>
          </motion.div>
        )}
        
        {/* Loading Indicator */}
        {loading && (
          <motion.div
            className="absolute top-6 left-1/2 -translate-x-1/2 px-4 py-2 glass rounded-full shadow-float"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
          >
            <div className="flex items-center gap-2 text-sm">
              <svg className="animate-spin h-4 w-4 text-[var(--accent-primary)]" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              <span className="text-white/70">Loading countries...</span>
            </div>
          </motion.div>
        )}
      </motion.div>

      {/* Tooltip */}
      {tooltip && (
        <motion.div
          className="fixed z-10 px-4 py-2 rounded-lg glass shadow-float pointer-events-none"
          style={{
            left: tooltip.x + 10,
            top: tooltip.y + 10,
          }}
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.8 }}
        >
          <div className="text-sm font-medium text-text-primary">{tooltip.content}</div>
        </motion.div>
      )}

      {/* Map Controls - Bottom Left */}
    </>
  );
}
