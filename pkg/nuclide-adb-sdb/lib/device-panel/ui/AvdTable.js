/**
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 *
 * @flow
 * @format
 */

import type {Expected} from '../../../../commons-node/expected';
import type {Avd} from '../AvdComponentProvider';

import {Button} from 'nuclide-commons-ui/Button';
import {ButtonGroup} from 'nuclide-commons-ui/ButtonGroup';
import {Table} from 'nuclide-commons-ui/Table';
import * as React from 'react';

type RowData = {
  avd: Avd,
};

type Props = {
  avds: Expected<Avd[]>,
  headerElement: React.Node,
  startAvd: (avd: Avd) => void,
};

export default class AvdTable extends React.Component<Props> {
  _renderAvd = (rowProps: {data: Avd}): React.Node => {
    const {startAvd} = this.props;
    const avd = rowProps.data;
    return (
      <div className="nuclide-adb-sdb-emulator-row">
        {avd}
        <ButtonGroup>
          <Button
            icon={'triangle-right'}
            onClick={() => startAvd(avd)}
            size="SMALL"
          />
        </ButtonGroup>
      </div>
    );
  };

  _renderEmptyComponent = (): React.Node => {
    const {avds} = this.props;
    return (
      <div className="nuclide-adb-sdb-emulator-empty-message">
        {avds.isError ? avds.error.message : 'No emulators found.'}
      </div>
    );
  };

  render(): React.Node {
    const {avds, headerElement} = this.props;

    const rowData: RowData[] = avds.getOrDefault([]).map(avd => {
      return {avd};
    });

    return (
      <Table
        collapsable={false}
        columns={[
          {
            title: 'Emulators',
            key: 'avd',
            component: this._renderAvd.bind(this),
          },
        ]}
        emptyComponent={this._renderEmptyComponent}
        fixedHeader={true}
        headerElement={headerElement}
        rows={rowData.map(data => {
          return {data};
        })}
      />
    );
  }
}
