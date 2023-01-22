import React, { FC, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  blue,
  company,
  detail,
  emptyList,
  list,
  name,
  no,
  not,
  request,
  requested,
  status,
  tick,
  ticket,
  pending,
  canceled,
  rejected,
  accepted,
  isLeader,
  isStore,
} from 'tools/i18n/constants/i18n';
import PagesLayout from 'pages/components/layout';
import YourListIsEmpty from 'pages/components/emptyList';
import { Loading } from 'components';
import useCompany from './useCompanies';
import { option, TableSectionTitle } from 'components/tables';
import Link from 'components/link';
import DataTables from 'components/tables/dataTable';
import { BLUE_TICKET_STATUS, BLUE_TICKET_STATUS_UI } from 'tools/enums';
import { Button } from 'reactstrap';
import Icon, { IconsName } from 'components/icons';
import { ApolloError } from '@apollo/client';
import { useToggle } from 'hooks';
import { FormCheck } from 'react-bootstrap';

export default function Companies() {
  const { isEmptyList, t, fetchMore, loading, error, data, refetch, count } = useCompany();
  return (
    <PagesLayout>
      <Loading loading={loading} failed={!!error} onRetry={refetch}>
        {isEmptyList ? (
          <div className="d-flex flex-column w-100">
            <div className="w-100">
              <CompaniesTable
                refetch={refetch}
                count={count}
                loading={loading}
                fetchMore={fetchMore}
                error={error}
                data={data}
              />
            </div>
          </div>
        ) : (
          <div className="py-3">
            <YourListIsEmpty title={`${t(emptyList)}`} />
          </div>
        )}
      </Loading>
    </PagesLayout>
  );
}

interface CategoryTableProps {
  data: unknown[];
  fetchMore: any;
  refetch: any;
  loading: boolean;
  error?: ApolloError;
  count?: number;
}

const CompaniesTable: FC<CategoryTableProps> = (props) => {
  const { data, error, loading, fetchMore, count, refetch } = props;
  const [toggleLoading, loadingToggler] = useToggle(loading);
  const [dataCount, setCount] = useState(count || 0);
  const [realData, setRealData] = useState<unknown[]>(data || []);
  const [currentPerRow, setCurrentPerRow] = useState(50);
  const { t } = useTranslation();
  const onSearch = (key: string) => {
    fetchMore({
      variables: {
        searchQuery: key,
      },
    }).then((res: any) => {
      setRealData(() => [...(res?.data.getCompanyList?.listResponse?.data || [])]);
    });
  };
  const onPageChange = (page: number) => {
    fetchMore({
      variables: {
        page,
        size: currentPerRow,
      },
    }).then((res: any) => {
      setRealData(() => [...(res?.data.getCompanyList?.listResponse?.data || [])]);
    });
  };
  const columnData = useMemo(() => {
    return [
      {
        name: <TableSectionTitle name={'FiAperture'} title={`${t(company)} ${t(name)}`} />,
        center: false,
        cell: (r: any) => {
          console.log(r);
          return (
            <Link className="text-black" to={'usersDetails'} param={r.id.toString()}>
              <div className="d-flex">
                {r.logoUrl ? (
                  <img
                    className="rounded-circle"
                    style={{ minWidth: '35px', minHeight: '35px', maxHeight: '35px', maxWidth: '35px' }}
                    alt={r.companyName}
                    src={r.logoUrl}
                  />
                ) : (
                  <Icon size="35px" Name="FiAperture" />
                )}
                <span className="ml-2">{r.companyName}</span>
              </div>
            </Link>
          );
        },
      },
      {
        name: <TableSectionTitle name="FiType" title={`${t(blue)} ${t(ticket)} ${t(status)}`} />,
        selector: (r: any) => r.blueMark,
        cell: (r: any) => {
          const s = r?.blueMark?.status;
          const Item =
            s === BLUE_TICKET_STATUS.ACCEPTED
              ? {
                  icon: 'FiCheck',
                  className: 'shadow-bg-active',
                  textColor: 'shadow-text-active',
                  text: BLUE_TICKET_STATUS_UI.ACCEPTED,
                }
              : s === BLUE_TICKET_STATUS.REJECTED
              ? {
                  icon: 'FiXOctagon',
                  className: 'shadow-bg-danger',
                  textColor: 'shadow-text-danger',
                  text: BLUE_TICKET_STATUS_UI.REJECTED,
                }
              : s === BLUE_TICKET_STATUS.CANCELED
              ? {
                  icon: 'FiX',
                  className: 'shadow-bg-danger',
                  textColor: 'shadow-text-danger',
                  text: BLUE_TICKET_STATUS_UI.CANCELED,
                }
              : s === BLUE_TICKET_STATUS.NOT_REQUESTED
              ? {
                  icon: 'FiMinus',
                  className: 'shadow-bg-notActive',
                  textColor: 'shadow-text-notActive',
                  text: `${t(not)} ${t(requested)}`,
                }
              : {
                  icon: 'FiLoader',
                  className: 'shadow-bg-warning',
                  textColor: 'shadow-text-warning',
                  text: BLUE_TICKET_STATUS_UI.IN_PROGRESS,
                };
          return (
            <div className="d-flex align-items-center">
              <div
                style={{ width: '30px', height: '30px' }}
                className={`${Item.className} d-flex align-items-center justify-content-center p-1 rounded-circle mr-2`}
              >
                <Icon Name={Item.icon as IconsName} size="20px" />
              </div>
              <span className={Item.textColor}>{Item.text}</span>
            </div>
          );
        },
      },
      {
        name: <TableSectionTitle name="FiAward" title={t(isLeader)} />,
        selector: (r: any) => r.verifiedForRehber,
        center: true,
        cell: (r: any) => {
          return <FormCheck type="checkbox" checked={r?.verifiedForRehber} />;
        },
      },
      {
        name: <TableSectionTitle name="FiShoppingBag" title={t(isStore)} />,
        selector: (r: any) => r.isStore,
        center: true,
        cell: (r: any) => {
          return <FormCheck type="checkbox" checked={r?.verifiedForStore} />;
        },
      },
      {
        name: '',
        center: false,
        cell: (r: { id: any }) => {
          return (
            <Link className="text-white ml-auto" to={'companiesDetails'} param={r.id.toString()}>
              <Button color="primary">{t(detail)}</Button>
            </Link>
          );
        },
      },
    ];
  }, [data]);
  const filterOptions: option[] = [
    {
      firstItem: true,
      firstItemTitle: `${t(blue)} ${t(tick)} ${t(status)}`,
      title: `${t(accepted)}`,
      name: BLUE_TICKET_STATUS.ACCEPTED,
      icon: 'FiCheck',
    },
    {
      title: `${t(rejected)}`,
      name: BLUE_TICKET_STATUS.REJECTED,
      icon: 'FiX',
    },
    {
      title: `${t(pending)}`,
      name: BLUE_TICKET_STATUS.IN_PROGRESS,
      icon: 'FiLoader',
    },
    {
      title: `${t(canceled)}`,
      name: BLUE_TICKET_STATUS.CANCELED,
      icon: 'FiAlertCircle',
    },
    {
      title: `${t(no)} ${t(request)}`,
      name: BLUE_TICKET_STATUS.NOT_REQUESTED,
      icon: 'FiMinus',
    },
    {
      firstItem: true,
      firstItemTitle: `${t(company)} ${t(status)}`,
      title: t(isLeader),
      name: 'isLeader',
      icon: 'FiAward',
    },
    {
      title: t(isStore),
      name: 'isStore',
      icon: 'FiShoppingBag',
    },
  ];
  const onChangeRowsPerPage = (currentPerRow: number, currentPage: number) => {
    console.log(currentPerRow, currentPage);
    setCurrentPerRow(currentPerRow);
    fetchMore({
      variables: {
        size: currentPerRow,
        page: currentPage,
      },
    }).then((res: any) => {
      setRealData(() => [...(res?.data.getCompanyList?.listResponse?.data || [])]);
      console.log(res);
    });
    console.log('currentPage : ', currentPage);
  };
  const onFilter = (key: string) => {
    loadingToggler(true);
    fetchMore({
      variables: { blueTickStatus: key },
    })
      .then((res: any) => {
        console.log(res);
        setRealData(res?.data.getCompanyList?.listResponse?.data);
        setCount(res?.data.getCompanyList?.listResponse?.count);
        loadingToggler(false);
      })
      .catch((e: any) => {
        console.error(e);
        loadingToggler(false);
      });
  };

  return (
    <DataTables
      data={realData}
      filterable
      searchable
      filterOptions={filterOptions}
      headerTitle={`${t(company)} ${t(list)}`}
      columns={columnData}
      onSearch={onSearch}
      onFilter={onFilter}
      disabled={toggleLoading || !!error}
      onChangePage={onPageChange}
      onChangeRowsPerPage={onChangeRowsPerPage}
      paginationRowsPerPageOptions={[50, 60, 70, 80]}
      pagination
      responsive
      paginationTotalRows={dataCount}
      paginationPerPage={currentPerRow}
      paginationServerOptions={{
        persistSelectedOnPageChange: true,
      }}
    />
  );
};
