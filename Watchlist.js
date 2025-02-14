"use client";
import React, { useState, useEffect, useCallback, useMemo, memo, useRef } from 'react';
import {
  Box,
  List,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Typography,
  ListItem,
  Collapse,
  IconButton,
  Tabs,
  Tab,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow
} from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import TableSortLabel from '@mui/material/TableSortLabel';
import { SORT_OPTIONS } from '../constants/watchlistSortOptions';

const mockWatchlists = {
  'BUY1': [], 
  'BUY2': [],
  'OWNED': [],
  'WATCHLIST': []
};

const EXCLUDED_SYMBOLS = ['CRC', 'CTP','KVC', 'ST8', 'MST', 'GKM', 'AAH','IDJ', 'VHC', 'C69', 'VPI', 'VFS', 'KDC', 'TCM', 'FIT', 'MST', 'HHG','NAG', 'VTZ', 'DCL', 'APG'];

const WatchlistRow = memo(({ item, onSymbolOnlyClick, onRowClick }) => {
  const getRatioColor = (value) => {
    const numValue = parseFloat(value);
    if (numValue <= 0.6) return 'error.main';
    if (numValue >= 2) return 'success.main';
    if (numValue >= 1.4) return '#1976d2';
    return 'text.secondary';
  };

  const LAYOUT = {
    WIDTHS: {
      SYMBOL: '34px',
      NAME: 'auto',
      RATIO: '30px',
      PRICE_CONTAINER: '75px',
      VALUE: '30px'
    },
    SPACING: {
      GAP: '2px',
      MARGIN: '0px'
    }
  };

  const commonNumberStyle = {
    fontSize: '0.65rem',
    fontWeight: 500,
    textAlign: 'right',
    flexShrink: 0,
    lineHeight: 1.2
  };

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', width: '100%' }}>
      <Box sx={{ 
        display: 'flex', 
        width: '100%',
        alignItems: 'center',
        gap: LAYOUT.SPACING.GAP,
        py: 0.25
      }}>
        <Typography 
          onClick={(e) => onSymbolOnlyClick(e, item.symbol)}
          sx={{ 
            width: LAYOUT.WIDTHS.SYMBOL,
            color: '#1976d2',
            fontSize: '0.65rem',
            fontWeight: 600,
            cursor: 'pointer',
            '&:hover': { textDecoration: 'underline' }
          }}
        >
          {item.symbol}
        </Typography>
        <Box sx={{ flex: 1 }} />
        <Box sx={{ 
          display: 'flex',
          alignItems: 'center',
          gap: LAYOUT.SPACING.GAP
        }}>
          <Typography
            sx={{
              ...commonNumberStyle,
              width: LAYOUT.WIDTHS.RATIO,
              color: getRatioColor(item.buySellRatio)
            }}
          >
            [{item.buySellRatio}
          </Typography>
          <Typography
            sx={{
              ...commonNumberStyle,
              width: LAYOUT.WIDTHS.RATIO,
              color: getRatioColor(item.largeVolRatio)
            }}
          >
            {item.largeVolRatio}
          </Typography>
          <Typography
            sx={{
              ...commonNumberStyle,
              width: LAYOUT.WIDTHS.RATIO,
              color: getRatioColor(item.top10VolRatio)
            }}
          >
            {item.top10VolRatio}]
          </Typography>
          {[
            item.largeAvgRatio,
            item.top10AvgRatio
          ].map((value, idx) => (
            <Typography
              key={idx}
              sx={{
                ...commonNumberStyle,
                width: LAYOUT.WIDTHS.RATIO,
                color: getRatioColor(value)
              }}
            >
              {value}
            </Typography>
          ))}
          <Typography sx={{
            ...commonNumberStyle,
            width: LAYOUT.WIDTHS.PRICE_CONTAINER,
            color: parseFloat(item.changeAbs) > 0 ? 'success.main' : 
                   parseFloat(item.changeAbs) < 0 ? 'error.main' : 
                   'text.primary'
          }}>
            {item.price}
          </Typography>
        </Box>
      </Box>
      <Box sx={{ 
        display: 'flex', 
        width: '100%',
        alignItems: 'center',
        mt: 0.25,
        gap: LAYOUT.SPACING.GAP
      }}>
        <Typography 
          sx={{ 
            flex: 1,
            fontSize: '0.7rem',
            color: 'text.secondary',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            whiteSpace: 'nowrap',
            paddingRight: '8px'
          }}
        >
          {item.name}
        </Typography>
        <Box sx={{ 
          display: 'flex',
          alignItems: 'center',
          gap: LAYOUT.SPACING.GAP
        }}>
          {[
            { value: item.volume, color: 'text.secondary' },
            { 
              value: item.vol20ratio, 
              color: parseFloat(item.vol20ratio) > 1.9 ? 'error.main' : 'text.secondary'
            },
            { value: item.netForeign, color: parseFloat(item.netForeign) > 0 ? 'success.main' : 
                                             parseFloat(item.netForeign) < 0 ? 'error.main' : 
                                             'text.secondary' }
          ].map((val, idx) => (
            <Typography
              key={idx}
              sx={{
                ...commonNumberStyle,
                width: LAYOUT.WIDTHS.VALUE,
                color: val.color
              }}
            >
              {val.value}
            </Typography>
          ))}
          <Box sx={{ 
            width: LAYOUT.WIDTHS.PRICE_CONTAINER,
            display: 'flex',
            justifyContent: 'flex-end',
            gap: '2px'
          }}>
            <Typography sx={{
              ...commonNumberStyle,
              color: parseFloat(item.changeAbs) > 0 ? 'success.main' : 
                     parseFloat(item.changeAbs) < 0 ? 'error.main' : 
                     'text.primary'
            }}>
              {item.changeAbs}
            </Typography>
            <Typography sx={{
              ...commonNumberStyle,
              color: 'text.secondary'
            }}>
              /
            </Typography>
            <Typography sx={{
              ...commonNumberStyle,
              color: parseFloat(item.changeAbs) > 0 ? 'success.main' : 
                     parseFloat(item.changeAbs) < 0 ? 'error.main' : 
                     'text.primary'
            }}>
              {item.change}
            </Typography>
          </Box>
        </Box>
      </Box>
    </Box>
  );
});

const OrdersPanel = memo(({ symbol, data }) => {
  const [orderBy, setOrderBy] = useState('last_vol');
  const [order, setOrder] = useState('desc');

  const formatNumber = (num) => {
    if (!num) return '0';
    return num.toLocaleString();
  };

  const formatRatio = (ratio) => {
    if (!ratio) return '0';
    return parseFloat(ratio).toFixed(2);
  };

  if (!data || !data.orders) return <Typography sx={{fontSize: '0.7rem'}} >Loading orders...</Typography>;

  const handleSort = (property) => {
    const isAsc = orderBy === property && order === 'asc';
    setOrder(isAsc ? 'desc' : 'asc');
    setOrderBy(property);
  };

  const sortedData = [...data.orders].sort((a, b) => {
    let comparison = 0;
    if (orderBy === 'time') {
      comparison = a.trading_time - b.trading_time;
    } else if (orderBy === 'last_price') {
      comparison = parseFloat(a.last_price) - parseFloat(b.last_price);
    } else if (orderBy === 'last_vol') {
      comparison = parseFloat(a.last_vol) - parseFloat(b.last_vol);
    } else if (orderBy === 'side') {
      comparison = a.side - b.side;
    }
    return order === 'desc' ? -comparison : comparison;
  });

  const tableStyles = {
    firstCol: {
      width: '25%',
      padding: '2px',
      whiteSpace: 'nowrap',
      fontSize: '0.65rem'
    },
    secondCol: {
      width: '25%',
      padding: '2px',
      whiteSpace: 'nowrap',
      paddingLeft: '44px',
      fontSize: '0.65rem'
    },
    thirdCol: {
      width: '25%',
      padding: '2px',
      whiteSpace: 'nowrap',
      fontSize: '0.65rem'
    },
    fourthCol: {
      width: '25%',
      padding: '2px',
      whiteSpace: 'nowrap',
      paddingLeft: '34px',
      fontSize: '0.65rem'
    }
  };

  return (
    <Box sx={{ 
      height: '100%', 
      display: 'flex', 
      flexDirection: 'column',
      overflow: 'hidden'
    }}>
      {/* Stats Panel with reduced font sizes */}
      <Box sx={{ 
        p: 0.75, 
        backgroundColor: '#f8f9fa',
        borderBottom: '1px solid rgba(224, 224, 224, 0.5)',
        display: 'grid',
        gridTemplateColumns: 'repeat(4, 1fr)',
        gap: 0.5,
        fontSize: '0.7rem',
        flexShrink: 0
      }}>
        <Box>
          <Typography variant="caption" sx={{ fontSize: '0.6rem' }} color="textSecondary">
            Orders (B/S)
          </Typography>
          <Typography sx={{ fontSize: '0.7rem' }}>
            {formatNumber(data?.ratioData?.buy_orders || 0)} / {formatNumber(data?.ratioData?.sell_orders || 0)}
          </Typography>
        </Box>
        
        {/* Repeat for other stat boxes with same font sizes */}
        <Box>
          <Typography variant="caption" sx={{ fontSize: '0.7rem' }} color="textSecondary">ATO/ATC Vol</Typography>
          <Typography sx={{ fontSize: '0.7rem' }}>
            {formatNumber(data?.ratioData?.ato_volume || 0)} / {formatNumber(data?.ratioData?.atc_volume || 0)}
          </Typography>
        </Box>

        <Box>
          <Typography variant="caption" sx={{ fontSize: '0.7rem' }} color="textSecondary">Foreign (B/S)</Typography>
          <Typography sx={{ fontSize: '0.7rem' }}>
            {formatNumber(data?.foreignData?.FOREIGN_BUY || 0)} / {formatNumber(data?.foreignData?.FOREIGN_SELL || 0)}
          </Typography>
        </Box>

        <Box>
          <Typography 
            sx={{ fontSize: '0.7rem' }} 
            color={
              (data?.foreignData?.FOREIGN_BUY || 0) - (data?.foreignData?.FOREIGN_SELL || 0) > 0 
                ? 'success.main' 
                : 'error.main'
            }
          >
            Net: {formatNumber((data?.foreignData?.FOREIGN_BUY || 0) - (data?.foreignData?.FOREIGN_SELL || 0))}
          </Typography>
        </Box>

        <Box>
          <Typography variant="caption" sx={{ fontSize: '0.7rem' }} color="textSecondary">MO B/S Ratio</Typography>
          <Typography sx={{ fontSize: '0.7rem' }} color={data?.ratioData?.mo_buy_sell_ratio > 1 ? 'success.main' : 'error.main'}>
            {formatRatio(data?.ratioData?.mo_buy_sell_ratio)}
          </Typography>
        </Box>

        <Box>
          <Typography variant="caption" sx={{ fontSize: '0.7rem' }} color="textSecondary">MO Large Ratio</Typography>
          <Typography sx={{ fontSize: '0.7rem' }} color={data?.ratioData?.mo_large_vol_ratio > 1 ? 'success.main' : 'error.main'}>
            {formatRatio(data?.ratioData?.mo_large_vol_ratio)}
          </Typography>
        </Box>

        <Box>
          <Typography variant="caption" sx={{ fontSize: '0.7rem' }} color="textSecondary">MO Top10 Ratio</Typography>
          <Typography sx={{ fontSize: '0.7rem' }} color={data?.ratioData?.mo_10_vol_ratio > 1 ? 'success.main' : 'error.main'}>
            {formatRatio(data?.ratioData?.mo_10_vol_ratio)}
          </Typography>
        </Box>

        <Box>
          <Typography variant="caption" sx={{ fontSize: '0.7rem' }} color="textSecondary">MO Avg Ratio</Typography>
          <Typography sx={{ fontSize: '0.7rem' }} color={data?.ratioData?.mo_large_avg_ratio > 1 ? 'success.main' : 'error.main'}>
            {formatRatio(data?.ratioData?.mo_large_avg_ratio)}
          </Typography>
        </Box>
      </Box>

      {/* Table header with reduced sizes */}
      <Box sx={{ 
        borderBottom: '1px solid rgba(224, 224, 224, 1)',
        flexShrink: 0
      }}>
        <Table size="small" sx={{ '& .MuiTableCell-root': { fontSize: '0.65rem', py: 0.5 } }}>
          <TableHead>
            <TableRow>
              <TableCell sx={tableStyles.firstCol}>
                <TableSortLabel
                  active={orderBy === 'time'}
                  direction={orderBy === 'time' ? order : 'asc'}
                  onClick={() => handleSort('time')}
                >
                  Time
                </TableSortLabel>
              </TableCell>
              <TableCell align="left" sx={tableStyles.secondCol}>
                <TableSortLabel
                  active={orderBy === 'last_price'}
                  direction={orderBy === 'last_price' ? order : 'asc'}
                  onClick={() => handleSort('last_price')}
                >
                  Price
                </TableSortLabel>
              </TableCell>
              <TableCell align="left" sx={tableStyles.thirdCol}>
                <TableSortLabel
                  active={orderBy === 'last_vol'}
                  direction={orderBy === 'last_vol' ? order : 'asc'}
                  onClick={() => handleSort('last_vol')}
                >
                  Volume
                </TableSortLabel>
              </TableCell>
              <TableCell align="left" sx={tableStyles.fourthCol}>
                <TableSortLabel
                  active={orderBy === 'side'}
                  direction={orderBy === 'side' ? order : 'asc'}
                  onClick={() => handleSort('side')}
                >
                  Side
                </TableSortLabel>
              </TableCell>
            </TableRow>
          </TableHead>
        </Table>
      </Box>

      {/* Table body with reduced sizes */}
      <TableContainer 
        sx={{ 
          flex: 1,
          overflow: 'auto',
          pr: 2,
          '& .MuiTableCell-root': { 
            fontSize: '0.65rem',
            py: 0.5
          },
          '&::-webkit-scrollbar': {
            width: '6px',
            height: '6px'
          },
          '&::-webkit-scrollbar-track': {
            background: '#f5f5f5'
          },
          '&::-webkit-scrollbar-thumb': {
            background: '#ddd',
            borderRadius: '3px',
            '&:hover': {
              background: '#bbb'
            }
          }
        }}
      >
        <Table size="small" sx={{ pr: 2 }}>
          <TableBody>
            {sortedData.map((order, index) => (
              <TableRow key={index}>
                <TableCell sx={tableStyles.firstCol}>
                  {order.time}
                </TableCell>
                <TableCell align="right" sx={tableStyles.secondCol}>
                  {order.last_price}
                </TableCell>
                <TableCell align="right" sx={tableStyles.thirdCol}>
                  {order.last_vol.toLocaleString()}
                </TableCell>
                <TableCell 
                  align="right" 
                  sx={{ 
                    ...tableStyles.fourthCol,
                    color: order.side === 2 ? 'success.main' : 
                           order.side === 1 ? 'error.main' : 
                           'text.secondary'
                  }}
                >
                  {order.side === 2 ? 'Buy' : order.side === 1 ? 'Sell' : 'Ukn'}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </Box>
  );
});

const Watchlist = ({ onSymbolSelect, sortOption, sortDirection }) => {
  const [mounted, setMounted] = useState(false);
  const [expandedGroups, setExpandedGroups] = useState({
    'BUY1': true,
    'BUY2': true,
    'OWNED': true,
    'WATCHLIST': true
  });
  const [expandedSymbol, setExpandedSymbol] = useState(null);
  const [watchlistData, setWatchlistData] = useState([]);
  const [buy1Data, setBuy1Data] = useState([]);
  const [selectedTab, setSelectedTab] = useState('Orders');
  const [orderData, setOrderData] = useState({});
  const [buy2Data, setBuy2Data] = useState([]); // Add this state
  const [ownedData, setOwnedData] = useState([]); // Add this state

  // Add ref to store last used sort criteria
  const lastSortRef = useRef({ option: sortOption, direction: sortDirection });

  // Update ref when sort props change
  useEffect(() => {
    if (sortOption && sortDirection) {
      lastSortRef.current = { option: sortOption, direction: sortDirection };
      console.log('Watchlist: Updated last sort criteria:', lastSortRef.current);
    }
  }, [sortOption, sortDirection]);

  useEffect(() => {
    setMounted(true);
  }, []);

  const shortenCompanyName = (fullName) => {
    const firstSpaceIndex = fullName.indexOf(' ');
    return firstSpaceIndex >= 0 ? fullName.substring(firstSpaceIndex + 1) : fullName;
  };

  // Add debug logging
  useEffect(() => {
    console.log('Watchlist: Sort props changed:', { sortOption, sortDirection });
  }, [sortOption, sortDirection]);

  const fetchWatchlistData = useCallback(async () => {
    try {
      const response = await fetch('/api/watchlist');
      const data = await response.json();
      
      // Keep raw values for sorting
      const transformedData = data
        .filter(item => 
          (item.symbol.length <= 3 || item.symbol === 'VN30F1M' || item.symbol === 'VNINDEX' || item.symbol === 'VN30INDEX') && 
          !EXCLUDED_SYMBOLS.includes(item.symbol) &&
          item.volumeMA20 >= 240000 // Base volume filter
        )
        .map(item => ({
            symbol: item.symbol,
            name: shortenCompanyName(item.company_name || item.company_name_en || item.symbol),
            price: parseFloat(item.last_price || 0).toFixed(2),
            changeAbs: parseFloat(item.price_change || 0).toFixed(2),
            change: `${item.price_change > 0 ? '+' : ''}${((item.price_change / item.ref_price) * 100).toFixed(2)}%`,
            buySellRatio: parseFloat(item.buy_sell_ratio || 0).toFixed(2),
            largeVolRatio: parseFloat(item.large_vol_ratio || 0).toFixed(2),
            top10VolRatio: parseFloat(item.top_10_vol_ratio || 0).toFixed(2), // Remove toFixed here
            largeAvgRatio: parseFloat(item.large_avg_ratio || 0).toFixed(2),
            top10AvgRatio: parseFloat(item.top_10_avg_ratio || 0).toFixed(2),
            volume: (item.volume / 1000000).toFixed(2),
            volumeMA20: (item.volumeMA20 / 1000000).toFixed(2),
            vol20ratio: item.vol20ratio.toFixed(2),
            netForeign: (item.netForeign / 1000000).toFixed(2),
            rawVolume: item.volume,
            // top10VolRatio: parseFloat(item.top_10_vol_ratio || 0)
        }));

      // Get current sort criteria
      const currentSort = {
        option: lastSortRef.current.option || 'volume',
        direction: lastSortRef.current.direction || 'desc'
      };

      // WATCHLIST - Handle sorting and criteria
      const getSortValue = (item, option) => {
        const value = parseFloat(item[option]) || 0;
        return Number.isFinite(value) ? value : 0;
      };

      // Sort all data by current criteria first
      const sortedWatchlistData = transformedData
        .sort((a, b) => {
          const valueA = getSortValue(a, currentSort.option);
          const valueB = getSortValue(b, currentSort.option);
          return currentSort.direction === 'desc' ? valueB - valueA : valueA - valueB;
        })
        .slice(0, 24); // Get top 14 items

      // BUY1 - Fix sorting with raw values
      const buy1FilteredData = transformedData
        .filter(item => {
          const changePercent = Math.abs(parseFloat(item.change));
          const vol20ratio = parseFloat(item.vol20ratio);
          const top10VolRatio = item.top10VolRatio; // Already parsed as float
          const top10AvgRatio = item.top10AvgRatio;
          const largeAvgRatio = item.largeAvgRatio;
          const buySellRatio = item.buySellRatio;
          const netForeign = item.netForeign;
          
          // const vol20ratio = item.vol20ratio;
          

          



          // Debug log for filtering
          console.log('Filtering:', {
            symbol: item.symbol,
            top10VolRatio,
            changePercent,
            vol20ratio
          });

          return top10VolRatio >= 2 && 
                 changePercent < 4 &&
                 vol20ratio > 0.4 &&
                 top10AvgRatio > 1 &&
                 largeAvgRatio > 1 &&
                 buySellRatio > 1.1 &&
                 vol20ratio < 3 &&
                 netForeign < 0.1;
        })
        .sort((a, b) => b.top10VolRatio - a.top10VolRatio) // Sort using raw values
        // .slice(0, 10);

      console.log('BUY1 after sort:', buy1FilteredData.map(item => ({
        symbol: item.symbol,
        ratio: item.top10VolRatio
      })));

      // BUY2 - Update sorting to use Top10AvgRatio
      const buy2FilteredData = transformedData
        .filter(item => {
          const changePercent = Math.abs(parseFloat(item.change));
          const top10VolRatio = parseFloat(item.top10VolRatio); // Already parsed as float
          const largeAvgRatio = parseFloat(item.largeAvgRatio);
          const buySellRatio = parseFloat(item.buySellRatio);
          
          
          return changePercent < 4 &&
                //  item.volume >= 400000 &&
                 buySellRatio >= 1.4 &&
                 top10VolRatio >= 1.4 &&
                 largeAvgRatio >= 2;
        })
        .sort((a, b) => parseFloat(b.top10AvgRatio) - parseFloat(a.top10AvgRatio))
        // .slice(0, 10);

      // OWNED - Update to use correct sorting
      const ownedSymbols = ['POW','REE', 'HAG', 'DDV', 'SMC','HDG', 'MSH', 'PAN', 'SSB'];
      const ownedData = transformedData
        .filter(item => ownedSymbols.includes(item.symbol))
        .sort((a, b) => parseFloat(b.top10VolRatio) - parseFloat(a.top10VolRatio));

      // Update all lists
      mockWatchlists['WATCHLIST'] = sortedWatchlistData;
      mockWatchlists['BUY1'] = buy1FilteredData;
      mockWatchlists['BUY2'] = buy2FilteredData;
      mockWatchlists['OWNED'] = ownedData;
      
      // Update all states
      setWatchlistData(sortedWatchlistData);
      setBuy1Data(buy1FilteredData);
      setBuy2Data(buy2FilteredData); // Add this
      setOwnedData(ownedData); // Add this

      console.log('Lists updated:', {
        watchlist: sortedWatchlistData.length,
        buy1: buy1FilteredData.length,
        buy2: buy2FilteredData.length,
        owned: ownedData.length
      });

    } catch (error) {
      console.error('Error fetching watchlist data:', error);
    }
  }, []); 

  const fetchOrderData = async (symbol) => {
    try {
      const response = await fetch(`/api/orders?symbol=${symbol}`);
      const data = await response.json();
      setOrderData(prevData => ({
        ...prevData,
        [symbol]: data
      }));
    } catch (error) {
      console.error('Error fetching order data:', error);
    }
  };

  const handleSymbolOnlyClick = useCallback((e, symbol) => {
    e.stopPropagation();
    if (onSymbolSelect) {
      onSymbolSelect(symbol);
    }
  }, [onSymbolSelect]);

  const handleRowClick = useCallback((symbol) => {
    if (onSymbolSelect) {
      onSymbolSelect(symbol);
    }
    setExpandedSymbol(prev => prev === symbol ? null : symbol);
  }, [onSymbolSelect]);

  const handleAccordionChange = useCallback((panel) => (event, isExpanded) => {
    setExpandedGroups(prev => ({
      ...prev,
      [panel]: isExpanded
    }));
  }, []);

  const sortData = useCallback((data, option, direction) => {
    return [...data].sort((a, b) => {
      let valueA = parseFloat(a[option]) || 0;
      let valueB = parseFloat(b[option]) || 0;
      
      if (option === 'symbol') {
        valueA = a.symbol;
        valueB = b.symbol;
        return direction === 'asc' ? 
          valueA.localeCompare(valueB) : 
          valueB.localeCompare(valueA);
      }
      
      return direction === 'asc' ? valueA - valueB : valueB - valueA;
    });
  }, []);

  const transformedWatchlists = useMemo(() => {
    if (!watchlistData.length) return mockWatchlists;

    console.log('Sorting watchlist with:', { sortOption, sortDirection });

    return {
      'BUY1':  buy1Data, // sortData(buy1Data, sortOption, sortDirection),
      'BUY2': buy2Data, // sortData(buy2Data, sortOption, sortDirection), // Use buy2Data instead of mockWatchlists
      'OWNED': ownedData, //sortData(ownedData, sortOption, sortDirection), // Use ownedData instead of mockWatchlists
      'WATCHLIST': sortData(watchlistData, sortOption, sortDirection)
    };
  }, [watchlistData, buy1Data, buy2Data, ownedData, sortOption, sortDirection, sortData]); // Add new dependencies

  const renderNewsSection = useCallback((symbol) => (
    <Collapse in={expandedSymbol === symbol}>
      <Box sx={{ 
        backgroundColor: '#f8f9fa',
        borderTop: '1px solid #e0e0e0',
        display: 'flex',
        flexDirection: 'column',
        minHeight: '400px',
        maxHeight: '600px'
      }}>
        <Tabs 
          value={selectedTab}
          onChange={(e, newValue) => setSelectedTab(newValue)}
          sx={{ 
            borderBottom: 1, 
            borderColor: 'divider', 
            minHeight: '30px',  // Reduced from 36px
            '& .MuiTab-root': {
              minWidth: '25%',
              minHeight: '30px',  // Reduced from 36px
              fontSize: '0.75rem',
              textTransform: 'none',
              padding: '2px 8px'
            }
          }}
        >
          <Tab label="orders" value="Orders" />
          <Tab label="news" value="News" />
          <Tab label="fund" value="Fund" />
          <Tab label="f4" value="F4" />
        </Tabs>
        
        <Box sx={{ 
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden'
        }}>
          {selectedTab === 'Orders' && (
            <OrdersPanel symbol={symbol} data={orderData[symbol]} />
          )}
          {selectedTab === 'News' && (
            <Typography>News content coming soon...</Typography>
          )}
          {selectedTab === 'Fund' && (
            <Typography>Fund content coming soon...</Typography>
          )}
          {selectedTab === 'F4' && (
            <Typography>F4 content coming soon...</Typography>
          )}
        </Box>
      </Box>
    </Collapse>
  ), [expandedSymbol, selectedTab, orderData]);

  useEffect(() => {
    fetchWatchlistData();
    const intervalId = setInterval(fetchWatchlistData, 60000);
    return () => clearInterval(intervalId);
  }, []);

  useEffect(() => {
    if (expandedSymbol) {
      fetchOrderData(expandedSymbol);
    }
  }, [expandedSymbol]);

  const handleSymbolClick = (symbol) => {
    // Update SymbolTab's first tab with clicked symbol
    setTabSymbols(prev => ({
      ...prev,
      tab1: symbol
    }));

    // Update active tab
    setActiveTab('tab1');

    // Update TradingViewChart
    if (updateChartCallback) {
      updateChartCallback(symbol);
    }
  };

  if (!mounted) {
    return null;
  }

  return (
    <Box 
      sx={{ 
        display: 'flex', 
        height: '100%',
        width: '100%',
        overflow: 'hidden'
      }}
    >
      <List 
        sx={{
          width: '100%',
          height: '100%',
          overflowY: 'auto',
          paddingRight: '8px',
          '&::-webkit-scrollbar': {
            width: '8px'
          },
          '&::-webkit-scrollbar-track': {
            background: '#ffffff'
          },
          '&::-webkit-scrollbar-thumb': {
            background: '#f5f5f5',
            borderRadius: '4px',
            '&:hover': {
              background: '#e0e0e0'
            }
          }
        }}
      >
        {Object.entries(transformedWatchlists).map(([listName, symbols]) => (
          <Accordion
            key={listName}
            expanded={expandedGroups[listName]}
            onChange={handleAccordionChange(listName)}
            sx={{
              backgroundColor: '#fff',
              boxShadow: 'none',
              '&:not(:last-child)': {
                borderBottom: 0
              },
              '& .MuiCollapse-root': {
                marginTop: 0
              },
              '& .MuiAccordionDetails-root': {
                padding: '2px 4px'
              }
            }}
          >
            <AccordionSummary
              sx={{
                minHeight: '24px !important',
                '& .MuiAccordionSummary-content': {
                  margin: '1px 0 !important',
                  display: 'flex',
                  alignItems: 'center',
                  paddingRight: '4px'
                }
              }}
            >
              <IconButton size="small" sx={{ mr: 0.25, p: 0.25 }}>
                <ExpandMoreIcon sx={{ fontSize: '1rem' }} />
              </IconButton>
              <Typography 
                variant="subtitle2" 
                component="span"
                sx={{ fontSize: '0.75rem' }}
              >
                {listName}
              </Typography>
            </AccordionSummary>
            <AccordionDetails sx={{ padding: '4px 6px' }}>
              {symbols.map((item, index) => (
                <Box key={item.symbol}>
                  <ListItem
                    onClick={() => handleRowClick(item.symbol)}
                    sx={{
                      display: 'flex',
                      flexDirection: 'column',
                      padding: '2px 8px 2px 4px',
                      cursor: 'pointer',
                      backgroundColor: index % 2 === 0 ? '#ffffff' : '#f5f5f5',
                      '&:hover': {
                        backgroundColor: 'action.hover'
                      }
                    }}
                  >
                    <WatchlistRow 
                      item={item}
                      onSymbolOnlyClick={handleSymbolOnlyClick}
                    />
                  </ListItem>
                  {renderNewsSection(item.symbol)}
                </Box>
              ))}
            </AccordionDetails>
          </Accordion>
        ))}
      </List>
    </Box>
  );
};

export default memo(Watchlist);
