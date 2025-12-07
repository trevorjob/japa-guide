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
  const [highlightedCountry, setHighlightedCountry] = useState<string | null>(null);

  // Clear highlighted country when navigating away
  useEffect(() => {
    if (!selectedCountry) {
      setHighlightedCountry(null);
    }
  }, [selectedCountry]);

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
        console.log(`Loaded ${response.length} countries from API`);
        setCountriesData(response);
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

    // Create a map of country codes to data (by both alpha-3 and numeric codes)
    const countryDataMap = new Map(
      countriesData.map(c => [c.code.toUpperCase(), c])
    );
    
    // Also create map by alpha-2 codes for better matching
    const countryDataByAlpha2 = new Map(
      countriesData.map(c => [c.code_alpha2?.toUpperCase(), c]).filter(([k]) => k)
    );
    
    console.log('🗺️ Map Debug:', {
      totalCountriesFromAPI: countriesData.length,
      countriesWithAlpha2: Array.from(countryDataByAlpha2.keys()).length,
      sampleAlpha2Codes: Array.from(countryDataByAlpha2.keys()).slice(0, 10)
    });

    // Load world topology with ISO codes
    fetch('https://cdn.jsdelivr.net/npm/world-atlas@2/countries-50m.json')
      .then(response => response.json())
      .then((worldData: any) => {
        const countries: any = feature(worldData, worldData.objects.countries);
        
        // Create a mapping from numeric ISO codes to alpha-2 codes
        // This maps the TopoJSON's numeric 'id' to our API's alpha-2 codes
        const numericToAlpha2: Record<string, string> = {
          '004': 'AF', '008': 'AL', '012': 'DZ', '016': 'AS', '020': 'AD', '024': 'AO',
          '028': 'AG', '031': 'AZ', '032': 'AR', '036': 'AU', '040': 'AT',
          '044': 'BS', '048': 'BH', '050': 'BD', '051': 'AM', '052': 'BB',
          '056': 'BE', '060': 'BM', '064': 'BT', '068': 'BO', '070': 'BA',
          '072': 'BW', '076': 'BR', '084': 'BZ', '086': 'IO', '090': 'SB',
          '096': 'BN', '100': 'BG', '104': 'MM', '108': 'BI', '112': 'BY',
          '116': 'KH', '120': 'CM', '124': 'CA', '132': 'CV', '136': 'KY',
          '140': 'CF', '144': 'LK', '148': 'TD', '152': 'CL', '156': 'CN',
          '158': 'TW', '162': 'CX', '166': 'CC', '170': 'CO', '174': 'KM',
          '175': 'YT', '178': 'CG', '180': 'CD', '184': 'CK', '188': 'CR',
          '191': 'HR', '192': 'CU', '196': 'CY', '203': 'CZ', '204': 'BJ',
          '208': 'DK', '212': 'DM', '214': 'DO', '218': 'EC', '222': 'SV',
          '226': 'GQ', '231': 'ET', '232': 'ER', '233': 'EE', '234': 'FO',
          '238': 'FK', '239': 'GS', '242': 'FJ', '246': 'FI', '248': 'AX',
          '250': 'FR', '254': 'GF', '258': 'PF', '260': 'TF', '262': 'DJ',
          '266': 'GA', '268': 'GE', '270': 'GM', '275': 'PS', '276': 'DE',
          '288': 'GH', '292': 'GI', '296': 'KI', '300': 'GR', '304': 'GL',
          '308': 'GD', '312': 'GP', '316': 'GU', '320': 'GT', '324': 'GN',
          '328': 'GY', '332': 'HT', '334': 'HM', '336': 'VA', '340': 'HN',
          '344': 'HK', '348': 'HU', '352': 'IS', '356': 'IN', '360': 'ID',
          '364': 'IR', '368': 'IQ', '372': 'IE', '376': 'IL', '380': 'IT',
          '384': 'CI', '388': 'JM', '392': 'JP', '398': 'KZ', '400': 'JO',
          '404': 'KE', '408': 'KP', '410': 'KR', '414': 'KW', '417': 'KG',
          '418': 'LA', '422': 'LB', '426': 'LS', '428': 'LV', '430': 'LR',
          '434': 'LY', '438': 'LI', '440': 'LT', '442': 'LU', '446': 'MO',
          '450': 'MG', '454': 'MW', '458': 'MY', '462': 'MV', '466': 'ML',
          '470': 'MT', '474': 'MQ', '478': 'MR', '480': 'MU', '484': 'MX',
          '492': 'MC', '496': 'MN', '498': 'MD', '499': 'ME', '500': 'MS',
          '504': 'MA', '508': 'MZ', '512': 'OM', '516': 'NA', '520': 'NR',
          '524': 'NP', '528': 'NL', '531': 'CW', '533': 'AW', '534': 'SX',
          '535': 'BQ', '540': 'NC', '548': 'VU', '554': 'NZ', '558': 'NI',
          '562': 'NE', '566': 'NG', '570': 'NU', '574': 'NF', '580': 'MP',
          '581': 'UM', '583': 'FM', '584': 'MH', '585': 'PW', '586': 'PK',
          '591': 'PA', '598': 'PG', '600': 'PY', '604': 'PE', '608': 'PH',
          '612': 'PN', '616': 'PL', '620': 'PT', '624': 'GW', '626': 'TL',
          '630': 'PR', '634': 'QA', '638': 'RE', '642': 'RO', '643': 'RU',
          '646': 'RW', '654': 'SH', '659': 'KN', '660': 'AI', '662': 'LC',
          '666': 'PM', '670': 'VC', '674': 'SM', '678': 'ST', '682': 'SA',
          '686': 'SN', '688': 'RS', '690': 'SC', '694': 'SL', '702': 'SG',
          '703': 'SK', '704': 'VN', '705': 'SI', '706': 'SO', '710': 'ZA',
          '716': 'ZW', '724': 'ES', '728': 'SS', '729': 'SD', '732': 'EH',
          '740': 'SR', '744': 'SJ', '748': 'SZ', '752': 'SE', '756': 'CH',
          '760': 'SY', '762': 'TJ', '764': 'TH', '768': 'TG', '772': 'TK',
          '776': 'TO', '780': 'TT', '784': 'AE', '788': 'TN', '792': 'TR',
          '795': 'TM', '796': 'TC', '798': 'TV', '800': 'UG', '804': 'UA',
          '807': 'MK', '818': 'EG', '826': 'GB', '831': 'GG', '832': 'JE',
          '833': 'IM', '834': 'TZ', '840': 'US', '850': 'VI', '854': 'BF',
          '858': 'UY', '860': 'UZ', '862': 'VE', '876': 'WF', '882': 'WS',
          '887': 'YE', '894': 'ZM'
        };
        
        // Debug: Check mapping coverage
        const totalFeatures = countries.features.length;
        const mappedFeatures = countries.features.filter((f: any) => numericToAlpha2[f.id]).length;
        const matchedFeatures = countries.features.filter((f: any) => {
          const alpha2 = numericToAlpha2[f.id];
          return alpha2 && countryDataByAlpha2.has(alpha2);
        }).length;
        
        console.log('🌍 TopoJSON Mapping Stats:', {
          totalFeatures,
          mappedFeatures,
          matchedFeatures,
          unmappedSample: countries.features
            .filter((f: any) => !numericToAlpha2[f.id])
            .slice(0, 10)
            .map((f: any) => ({ id: f.id, name: f.properties?.name })),
          apiCodesNotInMap: Array.from(countryDataByAlpha2.keys())
            .filter(alpha2 => !Object.values(numericToAlpha2).includes(alpha2))
            .slice(0, 10)
        });

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
            // Map numeric ID to alpha-2 code
            const alpha2 = numericToAlpha2[d.id];
            const countryData = alpha2 ? countryDataByAlpha2.get(alpha2) : null;
            
            if (countryData && countryData.difficulty_score) {
              return colorScale(countryData.difficulty_score);
            }
            // Return different color for unmapped vs no data
            return alpha2 ? '#E0E0E0' : '#F5F5F5';
          })
          .attr('stroke', '#ffffff')
          .attr('stroke-width', 0.5)
          .attr('class', 'country')
          .style('cursor', (d: any) => {
            const alpha2 = numericToAlpha2[d.id];
            return alpha2 && countryDataByAlpha2.has(alpha2) ? 'pointer' : 'default';
          })
          .style('transition', 'all 0.2s ease')
          .on('mouseover', function(event, d: any) {
            const alpha2 = numericToAlpha2[d.id];
            const countryData = alpha2 ? countryDataByAlpha2.get(alpha2) : null;
            
            if (countryData) {
              d3.select(this)
                .attr('fill', '#0FF')
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
            const alpha2 = numericToAlpha2[d.id];
            const countryData = alpha2 ? countryDataByAlpha2.get(alpha2) : null;
            
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
            const alpha2 = numericToAlpha2[d.id];
            const countryData = alpha2 ? countryDataByAlpha2.get(alpha2) : null;
            
            if (countryData) {
              d3.select(this)
                .attr('fill', countryData.difficulty_score ? colorScale(countryData.difficulty_score) : '#E0E0E0')
                .attr('stroke-width', 0.5);
            }

            setTooltip(null);
          })
          .on('click', function(event, d: any) {
            const alpha2 = numericToAlpha2[d.id];
            const countryData = alpha2 ? countryDataByAlpha2.get(alpha2) : null;
            
            if (countryData) {
              // Set highlighted country
              setHighlightedCountry(alpha2);
              
              // Zoom to country
              const bounds = path.bounds(d);
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

              // Highlight selected country
              g.selectAll('path')
                .transition()
                .duration(300)
                .attr('fill', (pathData: any) => {
                  const pathAlpha2 = numericToAlpha2[pathData.id];
                  return pathAlpha2 === alpha2 ? '#0FF' : '#3A3A3A';
                })
                .attr('stroke-width', (pathData: any) => {
                  const pathAlpha2 = numericToAlpha2[pathData.id];
                  return pathAlpha2 === alpha2 ? 3 : 0.5;
                })
                .attr('stroke', (pathData: any) => {
                  const pathAlpha2 = numericToAlpha2[pathData.id];
                  return pathAlpha2 === alpha2 ? '#0FF' : '#1E1E1E';
                })
                .style('filter', (pathData: any) => {
                  const pathAlpha2 = numericToAlpha2[pathData.id];
                  return pathAlpha2 === alpha2 ? 'drop-shadow(0 0 15px #0FF) drop-shadow(0 0 25px #0FF)' : 'none';
                });
              
              // Navigate after animation
              setTimeout(() => {
                router.push(`/explore?country=${countryData.code.toLowerCase()}`);
              }, 800);
            }
          });

        // Add zoom behavior - restrict zoom out to prevent UI issues
        const zoom = d3.zoom()
          .scaleExtent([1.5, 8])  // Prevent zoom out below 1x (initial scale)
          .translateExtent([[-width * 1, -height * 1], [width * 2, height * 2]])  // Restrict panning bounds
          .on('zoom', (event) => {
            g.attr('transform', event.transform);
          });

        // Store zoom reference for cleanup
        zoomRef.current = zoom;

        svg.call(zoom as any);

        // Zoom to selected country if one is selected
        if (selectedCountry) {
          const selectedCode = selectedCountry.toUpperCase();
          const selectedCountryData = countryDataMap.get(selectedCode);
          const selectedAlpha2 = selectedCountryData?.code_alpha2?.toUpperCase();
          
          const selectedFeature = countries.features.find((f: any) => {
            const alpha2 = numericToAlpha2[f.id];
            return alpha2 === selectedAlpha2;
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
              .attr('fill', (d: any) => {
                const alpha2 = numericToAlpha2[d.id];
                return alpha2 === selectedAlpha2 ? '#0FF' : '#3A3A3A';
              })
              .attr('stroke-width', (d: any) => {
                const alpha2 = numericToAlpha2[d.id];
                return alpha2 === selectedAlpha2 ? 3 : 0.5;
              })
              .attr('stroke', (d: any) => {
                const alpha2 = numericToAlpha2[d.id];
                return alpha2 === selectedAlpha2 ? '#0FF' : '#1E1E1E';
              })
              .style('filter', (d: any) => {
                const alpha2 = numericToAlpha2[d.id];
                return alpha2 === selectedAlpha2 ? 'drop-shadow(0 0 15px #0FF) drop-shadow(0 0 25px #0FF)' : 'none';
              });
          }
        } else {
          // Reset to difficulty colors when no country selected
          g.selectAll('path')
            .attr('fill', (d: any) => {
              const alpha2 = numericToAlpha2[d.id];
              const countryData = alpha2 ? countryDataByAlpha2.get(alpha2) : null;
              
              if (countryData && countryData.difficulty_score) {
                return colorScale(countryData.difficulty_score);
              }
              return alpha2 ? '#E0E0E0' : '#F5F5F5';
            })
            .attr('stroke-width', 0.5)
            .attr('stroke', '#ffffff')
            .style('filter', 'none');
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
          className="w-full h-full" 
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
              <svg className="animate-spin h-4 w-4 text-accent-primary" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
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
