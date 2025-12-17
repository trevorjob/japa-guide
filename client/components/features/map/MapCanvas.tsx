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
    search?: string;
  };
  selectedRegion?: string | null;
  onCountrySelect?: (code: string) => void;
  onResultsUpdate?: (count: number, countries: string[]) => void;
}

export default function MapCanvas({ selectedCountry, filters, selectedRegion, onCountrySelect, onResultsUpdate }: MapCanvasProps) {
  const svgRef = useRef<SVGSVGElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const router = useRouter();
  const [tooltip, setTooltip] = useState<{ x: number; y: number; content: string } | null>(null);
  const zoomRef = useRef<any>(null);
  const [dimensions, setDimensions] = useState({ width: 0, height: 0 });
  const [countriesData, setCountriesData] = useState<CountryListData[]>([]);
  const [allCountriesData, setAllCountriesData] = useState<CountryListData[]>([]); // Cache all countries for color reset
  const [loading, setLoading] = useState(true);
  const [highlightedCountry, setHighlightedCountry] = useState<string | null>(null);
  const [isTransitioning, setIsTransitioning] = useState(false);
  // Ref to track if map has been rendered to avoid unnecessary re-renders
  const mapRenderedRef = useRef(false);
  const lastRenderKeyRef = useRef<string>('');
  // Track previous selected country to detect deselection
  const prevSelectedCountryRef = useRef<string | null>(null);

  // Fetch all countries once on mount for color reference
  useEffect(() => {
    const fetchAllCountries = async () => {
      try {
        const response = await countryService.getAll({});
        setAllCountriesData(response);
      } catch (error) {
        console.error('Error fetching all countries:', error);
      }
    };
    fetchAllCountries();
  }, []);

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
        
        if (filters?.search) {
          params.search = filters.search;
        }
        
        const response = await countryService.getAll(params);
        console.log(`Loaded ${response.length} countries from API`);
        setCountriesData(response);
        
        // Notify parent of results
        if (onResultsUpdate) {
          onResultsUpdate(response.length, response.map(c => c.code.toLowerCase()));
        }
        
        setLoading(false);
      } catch (error) {
        console.error('Error fetching countries:', error);
        setLoading(false);
      }
    };

    fetchCountries();
    // Note: onResultsUpdate is intentionally excluded from deps to prevent refetch on parent re-renders
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filters?.region, filters?.search]);

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

    // Capture ref at start for cleanup
    const svgElement = svgRef.current;
    
    // Create a render key based on what actually affects the map appearance
    const countryCodes = countriesData.map(c => c.code).sort().join(',');
    const renderKey = `${dimensions.width}x${dimensions.height}|${countryCodes}|${filters?.region || ''}`;
    
    // Skip re-render if nothing important changed
    if (lastRenderKeyRef.current === renderKey && mapRenderedRef.current) {
      return;
    }
    lastRenderKeyRef.current = renderKey;
    mapRenderedRef.current = true;

    const width = dimensions.width;
    const height = dimensions.height;

    // Clear existing SVG completely
    const svg = d3.select(svgElement);
    svg.selectAll('*').remove();

    // Set SVG dimensions
    svg
      .attr('width', width)
      .attr('height', height)
      .attr('viewBox', `0 0 ${width} ${height}`)
      .style('display', 'block');

    // Create projection with responsive scale - much more zoomed in on mobile
    const isMobile = width < 768;
    const baseScale = isMobile ? width / 2.5 : width / 7;  // Much more zoomed for mobile
    const projection = geoMercator()
      .scale(baseScale)
      .center([0, 20])   // Center slightly north to better show landmasses
      .translate([width / 2, height / 2]);

    const path = geoPath().projection(projection);

    // Create a map of country codes to data (by both alpha-3 and numeric codes)
    const countryDataMap = new Map(
      countriesData.map(c => [c.code.toUpperCase(), c])
    );
    
    // Also create map by alpha-2 codes for better matching
    const countryDataByAlpha2 = new Map(
      countriesData
        .map(c => [c.code_alpha2?.toUpperCase(), c] as const)
        .filter((entry): entry is [string, typeof entry[1]] => !!entry[0])
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

        // Region-based color palette (neutral, data-agnostic)
        const regionColors: Record<string, string> = {
          'Africa': '#7B8CDE',
          'Americas': '#6BBF8A', 
          'Asia': '#E8A87C',
          'Europe': '#85C1E9',
          'Oceania': '#C39BD3',
        };
        const defaultColor = '#B8C5D1'; // For countries without region data

        // Create container for zoom
        const g = svg.append('g');

        // Create a set of filtered country alpha-2 codes for quick lookup
        const filteredCountryCodes = new Set(
          countriesData.map(c => c.code_alpha2?.toUpperCase()).filter(Boolean)
        );
        const hasActiveFilter = filters?.region || filters?.search;

        // Draw countries with highlighting
        g.selectAll('path')
          .data(countries.features)
          .join('path')
          .attr('d', path as any)
          .attr('fill', (d: any) => {
            // Map numeric ID to alpha-2 code
            const alpha2 = numericToAlpha2[d.id];
            const countryData = alpha2 ? countryDataByAlpha2.get(alpha2) : null;
            
            // If there's an active filter, highlight only filtered countries
            if (hasActiveFilter) {
              if (alpha2 && filteredCountryCodes.has(alpha2)) {
                // Highlighted filtered country - use region color
                if (countryData && countryData.region) {
                  return regionColors[countryData.region] || '#4FFFB0';
                }
                return '#4FFFB0';
              } else {
                // Dimmed non-filtered country
                return '#2A2A2A';
              }
            }
            
            // No filter - use region-based colors
            if (countryData && countryData.region) {
              return regionColors[countryData.region] || defaultColor;
            }
            // Return different color for unmapped vs no data
            return alpha2 ? '#E0E0E0' : '#F5F5F5';
          })
          .attr('stroke', (d: any) => {
            const alpha2 = numericToAlpha2[d.id];
            if (hasActiveFilter && alpha2 && filteredCountryCodes.has(alpha2)) {
              return '#4FFFB0';
            }
            return '#ffffff';
          })
          .attr('stroke-width', (d: any) => {
            const alpha2 = numericToAlpha2[d.id];
            if (hasActiveFilter && alpha2 && filteredCountryCodes.has(alpha2)) {
              return 1.5;
            }
            return 0.5;
          })
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

              setTooltip({
                x: event.clientX,
                y: event.clientY,
                content: `${countryData.name}${countryData.region ? ` • ${countryData.region}` : ''}`
              });
            }
          })
          .on('mousemove', function(event, d: any) {
            const alpha2 = numericToAlpha2[d.id];
            const countryData = alpha2 ? countryDataByAlpha2.get(alpha2) : null;
            
            if (countryData) {
              setTooltip({
                x: event.clientX,
                y: event.clientY,
                content: `${countryData.name}${countryData.region ? ` • ${countryData.region}` : ''}`
              });
            }
          })
          .on('mouseout', function(event, d: any) {
            const alpha2 = numericToAlpha2[d.id];
            const countryData = alpha2 ? countryDataByAlpha2.get(alpha2) : null;
            
            if (countryData) {
              d3.select(this)
                .attr('fill', countryData.region ? (regionColors[countryData.region] || defaultColor) : '#E0E0E0')
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

              // Set transitioning state
              setIsTransitioning(true);
              setHighlightedCountry(alpha2);
              
              // Highlight selected country
              g.selectAll('path')
                .transition()
                .duration(400)
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
              
              // Trigger callback after zoom animation
              setTimeout(() => {
                setIsTransitioning(false);
                if (onCountrySelect) {
                  onCountrySelect(countryData.code.toLowerCase());
                }
              }, 750);
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

        // Add country labels for mobile on filtered countries
        if (isMobile && hasActiveFilter && filteredCountryCodes.size > 0) {
          g.selectAll('text')
            .data(countries.features.filter((d: any) => {
              const alpha2 = numericToAlpha2[d.id];
              return alpha2 && filteredCountryCodes.has(alpha2);
            }))
            .join('text')
            .attr('class', 'country-label')
            .attr('transform', (d: any) => {
              const centroid = path.centroid(d);
              return `translate(${centroid})`;
            })
            .attr('text-anchor', 'middle')
            .attr('dy', '.35em')
            .style('font-size', '6px')
            .style('font-weight', '400')
            .style('fill', '#ffffff')
            .style('pointer-events', 'none')
            .style('text-shadow', '0 1px 3px rgba(0,0,0,0.8), 0 0 5px rgba(0,0,0,0.5)')
            .text((d: any) => {
              const alpha2 = numericToAlpha2[d.id];
              const countryData = alpha2 ? countryDataByAlpha2.get(alpha2) : null;
              return countryData?.name || '';
            });
        }

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
        }
      })
      .catch(error => {
        console.error('Error loading map data:', error);
      });

    // Cleanup function - only runs on actual unmount, not on re-renders
    return () => {
      if (svgElement) {
        const svg = d3.select(svgElement);
        // Remove zoom behavior
        svg.on('.zoom', null);
        // Clear all elements
        svg.selectAll('*').remove();
        mapRenderedRef.current = false;
      }
    };
    // Use specific filter values instead of filter object to prevent reference changes
    // Note: selectedCountry and onCountrySelect are intentionally excluded - they're handled in separate effects
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [router, dimensions, countriesData, loading, filters?.region, filters?.search]);

  // Handle selected country highlight and zoom - SEPARATE effect to avoid full re-render
  useEffect(() => {
    if (!svgRef.current || dimensions.width === 0 || loading) return;
    // Wait for allCountriesData to be loaded for proper color reset
    if (allCountriesData.length === 0) return;
    
    const svg = d3.select(svgRef.current);
    const g = svg.select('g');
    if (g.empty()) return;
    
    // Build country data maps - use allCountriesData for complete color reference
    const countryDataMap = new Map(
      allCountriesData.map(c => [c.code.toUpperCase(), c])
    );
    const allCountryDataByAlpha2 = new Map(
      allCountriesData
        .map(c => [c.code_alpha2?.toUpperCase(), c] as const)
        .filter((entry): entry is [string, typeof entry[1]] => !!entry[0])
    );
    
    // Check if there's an active filter
    const hasActiveFilter = filters?.region || filters?.search;
    
    // Create a set of filtered country alpha-2 codes for quick lookup
    const filteredCountryCodes = new Set(
      countriesData.map(c => c.code_alpha2?.toUpperCase()).filter(Boolean)
    );
    
    // Region-based color palette (matches initial render)
    const regionColors: Record<string, string> = {
      'Africa': '#7B8CDE',
      'Americas': '#6BBF8A', 
      'Asia': '#E8A87C',
      'Europe': '#85C1E9',
      'Oceania': '#C39BD3',
    };
    const defaultColor = '#B8C5D1';
    
    // Numeric to alpha2 mapping
    const numericToAlpha2: Record<string, string> = {
      '004': 'AF', '008': 'AL', '012': 'DZ', '016': 'AS', '020': 'AD', '024': 'AO',
      '028': 'AG', '031': 'AZ', '032': 'AR', '036': 'AU', '040': 'AT',
      '044': 'BS', '048': 'BH', '050': 'BD', '051': 'AM', '052': 'BB',
      '056': 'BE', '060': 'BM', '064': 'BT', '068': 'BO', '070': 'BA',
      '072': 'BW', '076': 'BR', '084': 'BZ', '090': 'SB', '096': 'BN',
      '100': 'BG', '104': 'MM', '108': 'BI', '112': 'BY', '116': 'KH',
      '120': 'CM', '124': 'CA', '132': 'CV', '140': 'CF', '144': 'LK',
      '148': 'TD', '152': 'CL', '156': 'CN', '170': 'CO', '178': 'CG',
      '180': 'CD', '188': 'CR', '191': 'HR', '192': 'CU', '196': 'CY',
      '203': 'CZ', '204': 'BJ', '208': 'DK', '214': 'DO', '218': 'EC',
      '818': 'EG', '222': 'SV', '226': 'GQ', '232': 'ER', '233': 'EE',
      '231': 'ET', '246': 'FI', '250': 'FR', '266': 'GA', '270': 'GM',
      '268': 'GE', '276': 'DE', '288': 'GH', '300': 'GR', '320': 'GT',
      '324': 'GN', '328': 'GY', '332': 'HT', '340': 'HN', '348': 'HU',
      '352': 'IS', '356': 'IN', '360': 'ID', '364': 'IR', '368': 'IQ',
      '372': 'IE', '376': 'IL', '380': 'IT', '384': 'CI', '388': 'JM',
      '392': 'JP', '400': 'JO', '398': 'KZ', '404': 'KE', '408': 'KP',
      '410': 'KR', '414': 'KW', '417': 'KG', '418': 'LA', '422': 'LB',
      '426': 'LS', '428': 'LV', '430': 'LR', '434': 'LY', '440': 'LT',
      '442': 'LU', '450': 'MG', '454': 'MW', '458': 'MY', '466': 'ML',
      '478': 'MR', '480': 'MU', '484': 'MX', '496': 'MN', '498': 'MD',
      '499': 'ME', '504': 'MA', '508': 'MZ', '516': 'NA', '524': 'NP',
      '528': 'NL', '554': 'NZ', '558': 'NI', '562': 'NE', '566': 'NG',
      '578': 'NO', '512': 'OM', '586': 'PK', '591': 'PA', '598': 'PG',
      '600': 'PY', '604': 'PE', '608': 'PH', '616': 'PL', '620': 'PT',
      '634': 'QA', '642': 'RO', '643': 'RU', '646': 'RW', '682': 'SA',
      '686': 'SN', '688': 'RS', '694': 'SL', '702': 'SG', '703': 'SK',
      '705': 'SI', '706': 'SO', '710': 'ZA', '724': 'ES', '729': 'SD',
      '740': 'SR', '748': 'SZ', '752': 'SE', '756': 'CH', '760': 'SY',
      '762': 'TJ', '764': 'TH', '768': 'TG', '788': 'TN', '792': 'TR',
      '795': 'TM', '800': 'UG', '804': 'UA', '784': 'AE', '826': 'GB',
      '834': 'TZ', '840': 'US', '858': 'UY', '860': 'UZ', '862': 'VE',
      '704': 'VN', '887': 'YE', '894': 'ZM', '716': 'ZW'
    };
    
    if (selectedCountry) {
      const selectedCode = selectedCountry.toUpperCase();
      const selectedCountryData = countryDataMap.get(selectedCode);
      const selectedAlpha2 = selectedCountryData?.code_alpha2?.toUpperCase();
      
      if (selectedAlpha2) {
        // Highlight selected country - dim others
        g.selectAll('path')
          .transition()
          .duration(300)
          .attr('fill', function() {
            const pathData = d3.select(this).datum() as any;
            const alpha2 = numericToAlpha2[pathData?.id];
            return alpha2 === selectedAlpha2 ? '#0FF' : '#3A3A3A';
          })
          .attr('stroke-width', function() {
            const pathData = d3.select(this).datum() as any;
            const alpha2 = numericToAlpha2[pathData?.id];
            return alpha2 === selectedAlpha2 ? 3 : 0.5;
          })
          .attr('stroke', function() {
            const pathData = d3.select(this).datum() as any;
            const alpha2 = numericToAlpha2[pathData?.id];
            return alpha2 === selectedAlpha2 ? '#0FF' : '#1E1E1E';
          })
          .style('filter', function() {
            const pathData = d3.select(this).datum() as any;
            const alpha2 = numericToAlpha2[pathData?.id];
            return alpha2 === selectedAlpha2 ? 'drop-shadow(0 0 15px #0FF) drop-shadow(0 0 25px #0FF)' : 'none';
          });
      }
    } else {
      // Reset to normal colors when no country selected
      // Respect filter state - if there's a filter, show filtered countries highlighted
      g.selectAll('path')
        .transition()
        .duration(400)
        .attr('fill', function() {
          const pathData = d3.select(this).datum() as any;
          const alpha2 = numericToAlpha2[pathData?.id];
          // Use allCountryDataByAlpha2 for proper color reference
          const countryData = alpha2 ? allCountryDataByAlpha2.get(alpha2) : null;
          
          // If there's an active filter, highlight only filtered countries
          if (hasActiveFilter) {
            if (alpha2 && filteredCountryCodes.has(alpha2)) {
              // Highlighted filtered country - use region color
              if (countryData && countryData.region) {
                return regionColors[countryData.region] || '#4FFFB0';
              }
              return '#4FFFB0';
            } else {
              // Dimmed non-filtered country
              return '#2A2A2A';
            }
          }
          
          // No filter - normal region-based colors using all countries data
          if (countryData && countryData.region) {
            return regionColors[countryData.region] || defaultColor;
          }
          return alpha2 ? '#E0E0E0' : '#F5F5F5';
        })
        .attr('stroke-width', function() {
          const pathData = d3.select(this).datum() as any;
          const alpha2 = numericToAlpha2[pathData?.id];
          if (hasActiveFilter && alpha2 && filteredCountryCodes.has(alpha2)) {
            return 1.5;
          }
          return 0.5;
        })
        .attr('stroke', function() {
          const pathData = d3.select(this).datum() as any;
          const alpha2 = numericToAlpha2[pathData?.id];
          if (hasActiveFilter && alpha2 && filteredCountryCodes.has(alpha2)) {
            return '#4FFFB0';
          }
          return '#ffffff';
        })
        .style('filter', 'none');
        
      // Handle zoom based on filter state
      if (hasActiveFilter && zoomRef.current) {
        // If region filter is active, zoom back to that region
        const activeRegion = filters?.region;
        if (activeRegion) {
          const width = dimensions.width;
          const height = dimensions.height;
          const isMobile = width < 768;
          const baseScale = isMobile ? width / 2.5 : width / 7;
          
          const regionBounds: Record<string, { center: [number, number], scale: number }> = {
            'Africa': { center: [20, 0], scale: isMobile ? width / 2.5 : width / 4 },
            'Americas': { center: [-80, 0], scale: isMobile ? width / 2.5 : width / 4 },
            'Asia': { center: [95, 34], scale: isMobile ? width / 3 : width / 5 },
            'Europe': { center: [15, 54], scale: isMobile ? width / 2 : width / 3 },
            'Oceania': { center: [140, -25], scale: isMobile ? width / 2.5 : width / 3.5 },
          };
          
          const bounds = regionBounds[activeRegion];
          if (bounds) {
            const projection = geoMercator()
              .scale(bounds.scale)
              .center(bounds.center)
              .translate([width / 2, height / 2]);
            
            svg.transition()
              .duration(750)
              .call(
                zoomRef.current.transform as any,
                d3.zoomIdentity
                  .translate(width / 2, height / 2)
                  .scale(bounds.scale / baseScale)
                  .translate(-projection(bounds.center)![0], -projection(bounds.center)![1])
              );
          }
        }
        // For search filter, just stay at current zoom (don't reset to world)
      } else if (zoomRef.current) {
        // No filter - reset to world view
        svg.transition()
          .duration(500)
          .call(zoomRef.current.transform as any, d3.zoomIdentity);
      }
    }
  }, [selectedCountry, dimensions, countriesData, allCountriesData, loading, filters]);

  // Handle region zoom when selectedRegion explicitly changes (from filter panel)
  useEffect(() => {
    if (!svgRef.current || dimensions.width === 0) return;
    
    // Update ref to track previous selected country
    prevSelectedCountryRef.current = selectedCountry;
    
    // Skip if a country is selected (country zoom takes precedence)
    if (selectedCountry) return;
    
    // Only zoom when selectedRegion is explicitly set (from filter change)
    if (!selectedRegion) return;

    const svg = d3.select(svgRef.current);
    const width = dimensions.width;
    const height = dimensions.height;
    const isMobile = width < 768;
    const baseScale = isMobile ? width / 2.5 : width / 7;

    // Define region boundaries (approximate lat/lon bounds)
    const regionBounds: Record<string, { center: [number, number], scale: number }> = {
      'Africa': { center: [20, 0], scale: isMobile ? width / 2.5 : width / 4 },
      'Americas': { center: [-80, 0], scale: isMobile ? width / 2.5 : width / 4 },
      'Asia': { center: [95, 34], scale: isMobile ? width / 3 : width / 5 },
      'Europe': { center: [15, 54], scale: isMobile ? width / 2 : width / 3 },
      'Oceania': { center: [140, -25], scale: isMobile ? width / 2.5 : width / 3.5 },
    };

    const bounds = regionBounds[selectedRegion];
    if (!bounds) return;

    const projection = geoMercator()
      .scale(bounds.scale)
      .center(bounds.center)
      .translate([width / 2, height / 2]);

    // Use zoomRef if available, otherwise create new zoom
    const zoom = zoomRef.current || d3.zoom()
      .scaleExtent([1.5, 8])
      .translateExtent([[-width * 1, -height * 1], [width * 2, height * 2]]);

    svg.transition()
      .duration(750)
      .call(
        zoom.transform as any,
        d3.zoomIdentity
          .translate(width / 2, height / 2)
          .scale(bounds.scale / baseScale)
          .translate(-projection(bounds.center)![0], -projection(bounds.center)![1])
      );
  }, [selectedRegion, selectedCountry, dimensions]);

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
        className="absolute inset-0"
        initial={{ opacity: 0 }}
        animate={{ 
          opacity: 1,
          filter: selectedCountry || isTransitioning ? 'blur(4px)' : 'blur(0px)',
        }}
        transition={{ 
          opacity: { duration: 0.5 },
          filter: { duration: 0.5, ease: 'easeInOut' }
        }}
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
